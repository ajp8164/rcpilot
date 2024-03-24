import { Alert, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import { Location, LocationCoords } from 'realmdb/Location';
import MapView, {
  Details,
  MapMarker,
  MapType,
  MarkerDragStartEndEvent,
  MarkerPressEvent,
  Region,
} from 'react-native-maps';
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useQuery, useRealm } from '@realm/react';

import ActionBar from 'components/atoms/ActionBar';
import { Button } from '@rneui/base';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { DateTime } from 'luxon';
import { GeoPositionContext } from 'lib/location';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { LocationNavigatorParamList } from 'types/navigation';
import { LocationPickerResult } from 'components/LocationsScreen';
import { MapMarkerCallout } from 'components/molecules/MapMarkerCallout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appConfig } from 'config';
import { makeStyles } from '@rneui/themed';
import { selectLocation } from 'store/selectors/locationSelectors';
import { useEvent } from 'lib/event';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { uuidv4 } from 'lib/utils';

// These are icon names.
enum RecenterButtonState {
  Initial = 'location-arrow',
  CurrentLocation = 'location-arrow-box',
  CurrentLocationNorthUp = 'location-arrow-track-up',
}

// These are icon names.
enum MapTypeButtonState {
  Map = 'satellite',
  Satellite = 'map',
}

type MapMarkerLocation = {
  mapMarker: MapMarker;
  location: Location;
  edit: boolean;
};

export type LocationsMapResult = {
  locationId: string;
};

export type Props = NativeStackScreenProps<LocationNavigatorParamList, 'LocationsMap'>;

const LocationsMapScreen = ({ navigation, route }: Props) => {
  const { eventName, locationId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const realm = useRealm();

  const locations = useQuery(Location);

  // If an initial location is specified from the caller then use that location. If no initial
  // location is specified then use an available closest location to our current position. Failing
  // to get any location record just set the map to our current position.
  const currentPosition = useContext(GeoPositionContext);
  let initialLocation = locations.find(location => location._id.toString() === locationId);

  const currentLocationId = useSelector(selectLocation).locationId;
  if (!initialLocation) {
    // Get closest the location closest to our current position.
    // Note: Current location is set using a radius around our current position.
    initialLocation = locations.find(l => l._id.toString() === currentLocationId);
  }

  const mapViewRef = useRef<MapView>(null);
  const markersRef = useRef<MapMarkerLocation[]>([]);
  const mapLocation = useRef({
    latitude: currentPosition.coords.latitude,
    longitude: currentPosition.coords.longitude,
  } as LocationCoords);

  const [mapPresentation, setMapPresentation] = useState<{ mapType: MapType; icon: string }>({
    mapType: 'standard',
    icon: MapTypeButtonState.Map,
  });

  const [recenterButtonState, setRecenterButtonState] = useState(RecenterButtonState.Initial);

  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<Icon name={'book-open'} style={s.headerIcon} />}
            onPress={() => navigation.navigate('Locations', { eventName: 'map-location' })}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  useEffect(() => {
    if (currentPosition.error) {
      const error = currentPosition.error;
      const title =
        error.code === 'PERMISSION_DENIED'
          ? 'Permission Denied'
          : error.code === 'POSITION_UNAVAILABLE'
            ? 'Position Unavailable'
            : 'Timeout';
      const message =
        error.code === 'PERMISSION_DENIED'
          ? `${error.message}\n\nLocation information is not available. Go to the Settings app to enable location services for ${appConfig.appName}.`
          : error.message;
      Alert.alert(title, message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    event.on('map-location', onChangeMapLocation);
    return () => {
      event.removeListener('map-location', onChangeMapLocation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeMapLocation = (result: LocationPickerResult) => {
    const newLocation = locations.find(l => l._id.toString() === result.locationId);
    if (newLocation) {
      mapViewRef.current?.animateToRegion({
        latitude: newLocation.coords.latitude,
        longitude: newLocation?.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const recenterMap = () => {
    if (currentPosition.coords) {
      // Set button state and heading.
      let heading;

      switch (recenterButtonState) {
        case RecenterButtonState.Initial:
          setRecenterButtonState(RecenterButtonState.CurrentLocation);
          break;
        case RecenterButtonState.CurrentLocation:
          setRecenterButtonState(RecenterButtonState.CurrentLocationNorthUp);
          heading = 0;
          break;
        case RecenterButtonState.CurrentLocationNorthUp:
          setRecenterButtonState(RecenterButtonState.Initial);
          break;
      }

      const partialCamera = {
        center: {
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        },
        heading,
        zoom: 100,
      };
      mapViewRef.current?.animateCamera(partialCamera);
    }
  };

  const toggleMapPresenation = () => {
    switch (mapPresentation.mapType) {
      case 'standard':
        setMapPresentation({ mapType: 'satellite', icon: MapTypeButtonState.Satellite });
        break;
      case 'satellite':
        setMapPresentation({ mapType: 'standard', icon: MapTypeButtonState.Map });
        break;
    }
  };

  const addLocation = () => {
    const now = DateTime.now().toISO();
    const id = uuidv4();
    realm.write(() => {
      const newLocation = realm.create(Location, {
        createdOn: now,
        updatedOn: now,
        name: 'Location-' + id.substring(id.length - 5),
        coords: mapLocation.current,
        notes: '',
      });

      if (eventName) {
        event.emit(eventName, { locationId: newLocation._id.toString() } as LocationsMapResult);
      }
    });

    // When a new location is added by dropping a pin the markersRef array length changes.
    // Show the callout for only the new location.
    setTimeout(() => {
      markersRef.current.forEach(marker => {
        marker.mapMarker.hideCallout();
      });
      markersRef.current[markersRef.current.length - 1]?.mapMarker.showCallout();
    }, 500); // Add for UX.
  };

  const onRegionChangeComplete = (region: Region, _details: Details) => {
    mapLocation.current = {
      latitude: region.latitude,
      longitude: region.longitude,
    } as LocationCoords;
  };

  const onMarkerDragEnd = (event: MarkerDragStartEndEvent, location: Location) => {
    realm.write(() => {
      location.coords.latitude = event.nativeEvent.coordinate.latitude;
      location.coords.longitude = event.nativeEvent.coordinate.longitude;
    });
  };

  const onMarkerPress = (markerEvent: MarkerPressEvent) => {
    console.log(markerEvent.nativeEvent.id);
    const x = markersRef.current.find(
      m => m.location?._id.toString() === markerEvent.nativeEvent.id,
    );
    x?.mapMarker.hideCallout();

    if (eventName) {
      event.emit(eventName, { locationId: markerEvent.nativeEvent.id } as LocationsMapResult);
      navigation.goBack();
    }
  };

  useFocusEffect(() => {
    const marker = markersRef.current.find(m => m.edit);
    if (marker) {
      marker.mapMarker.showCallout();
      marker.edit = false;
    }
  });

  const renderMapMarkers = (): JSX.Element[] => {
    return locations.map((location, index) => {
      if (!markersRef.current[index]) {
        markersRef.current[index] = {} as MapMarkerLocation;
      }
      return (
        <MapMarkerCallout
          ref={el => (el ? (markersRef.current[index].mapMarker = el) : null)}
          key={index}
          index={index}
          location={location}
          onMarkerDragEnd={onMarkerDragEnd}
          onPressCallout={() => {
            navigation.navigate('LocationEditor', {
              locationId: location._id.toString(),
            });
            markersRef.current[index].mapMarker.hideCallout();
            markersRef.current[index].edit = true;
          }}
        />
      );
    });
  };

  return (
    <View>
      <MapView
        ref={mapViewRef}
        style={s.map}
        showsUserLocation={true}
        mapType={mapPresentation.mapType}
        initialRegion={{
          latitude: initialLocation?.coords.latitude || currentPosition.coords.latitude,
          longitude: initialLocation?.coords.longitude || currentPosition.coords.longitude,
          latitudeDelta: currentPosition.error ? 10 : 0.01,
          longitudeDelta: currentPosition.error ? 10 : 0.01,
        }}
        onRegionChangeComplete={onRegionChangeComplete}
        onMarkerPress={onMarkerPress}>
        {renderMapMarkers()}
      </MapView>
      <ActionBar
        actions={[
          {
            ActionComponent: (
              <CustomIcon
                name={recenterButtonState}
                size={28}
                color={theme.colors.clearButtonText}
              />
            ),
            onPress: recenterMap,
          },
          {
            ActionComponent: (
              <Icon name={'location-dot'} size={28} color={theme.colors.clearButtonText} />
            ),
            onPress: addLocation,
          },
          {
            ActionComponent: (
              <Icon
                solid
                name={mapPresentation.icon}
                size={28}
                color={theme.colors.clearButtonText}
              />
            ),
            onPress: toggleMapPresenation,
          },
          {
            label: 'Done',
            onPress: navigation.goBack,
          },
        ]}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
  },
  map: {
    width: '100%',
    height: '100%',
  },
}));

export default LocationsMapScreen;
