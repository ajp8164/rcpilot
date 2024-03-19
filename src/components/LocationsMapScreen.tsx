import { Alert, Text, View } from 'react-native';
import Animated, { SlideInUp } from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import { GeoPositionContext, locationSummary } from 'lib/location';
import { Location, LocationCoords } from 'realmdb/Location';
import MapView, {
  Callout,
  CalloutSubview,
  Details,
  MapMarker,
  MapType,
  Marker,
  MarkerDragStartEndEvent,
  Region,
} from 'react-native-maps';
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SearchCriteria, SearchScope } from 'types/location';
import { useQuery, useRealm } from '@realm/react';

import ActionBar from 'components/atoms/ActionBar';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { DateTime } from 'luxon';
// import {default as Icon} from 'react-native-vector-icons/FontAwesome6';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { LocationNavigatorParamList } from 'types/navigation';
import { MapMarkerCallout } from 'components/molecules/MapMarkerCallout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appConfig } from 'config';
import { makeStyles } from '@rneui/themed';
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

const initialSearchCriteria = { text: '', scope: SearchScope.FullText };

export type Props = NativeStackScreenProps<LocationNavigatorParamList, 'LocationsMap'>;

const LocationsMapScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const realm = useRealm();

  const locations = useQuery(Location);
  const currentPosition = useContext(GeoPositionContext);

  const mapViewRef = useRef<MapView>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const mapLocation = useRef({ latitude: 0, longitude: 0 } as LocationCoords);
  const [mapPresentation, setMapPresentation] = useState<{ mapType: MapType; icon: string }>({
    mapType: 'standard',
    icon: MapTypeButtonState.Map,
  });
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(initialSearchCriteria);

  const [recenterButtonState, setRecenterButtonState] = useState(RecenterButtonState.Initial);

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
    mapLocation.current = {
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude,
    } as LocationCoords;
  }, [currentPosition]);

  useEffect(() => {
    setTimeout(() => {
      // Show the callout for only the last marker added.
      markersRef.current.forEach(marker => {
        marker.hideCallout();
      });
      markersRef.current[markersRef.current.length - 1]?.showCallout();
    }, 500); // Slight delay for ux.
  }, [locations]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        autoCapitalize: 'none',
        hideNavigationBar: true,
        onChangeText: event =>
          setSearchCriteria({
            text: event.nativeEvent.text,
            scope: SearchScope.FullText,
          }),
        onCancelButtonPress: resetSearch,
        onBlur: () => setSearchFocused(false),
        onFocus: () => setSearchFocused(true),
      },
    });
  }, [navigation]);

  const recenterMap = () => {
    if (currentPosition) {
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
      realm.create(Location, {
        createdOn: now,
        updatedOn: now,
        name: 'Location-' + id.substring(id.length - 5),
        coords: mapLocation.current,
        notes: '',
      });
    });
  };

  const resetSearch = () => {
    setSearchFocused(false);
    setSearchCriteria(initialSearchCriteria);
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

  const renderEventMarkers = (): JSX.Element[] => {
    return locations.map((location, index) => {
      return (
        <Marker
          ref={el => (el ? (markersRef.current[index] = el) : null)}
          key={index}
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title={location.name}
          calloutOffset={{ x: 0, y: -5 }}
          calloutAnchor={{ x: 0, y: 0 }}
          draggable
          onDragEnd={(event: MarkerDragStartEndEvent) => onMarkerDragEnd(event, location)}>
          <Animated.View entering={SlideInUp.duration(400)}>
            <Icon name={'map-pin'} color={'red'} size={30} style={s.pin} />
          </Animated.View>
          <Callout alphaHitTest tooltip style={s.callout}>
            <MapMarkerCallout>
              <CalloutSubview
                onPress={() =>
                  navigation.navigate('LocationEditor', {
                    locationId: location._id.toString(),
                  })
                }
                style={s.calloutSubview}>
                <View style={s.calloutTextContainer}>
                  <Text numberOfLines={1} style={s.calloutText1}>
                    {location.name}
                  </Text>
                  <Text numberOfLines={1} style={s.calloutText2}>
                    {locationSummary(location)}
                  </Text>
                </View>
                <Icon name={'chevron-right'} color={theme.colors.midGray} size={16} />
              </CalloutSubview>
            </MapMarkerCallout>
          </Callout>
        </Marker>
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
        region={{
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
          latitudeDelta: currentPosition.error ? 10 : 0.005,
          longitudeDelta: currentPosition.error ? 10 : 0.005,
        }}
        onRegionChangeComplete={onRegionChangeComplete}>
        {renderEventMarkers()}
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
  map: {
    width: '100%',
    height: '100%',
  },
  pin: {
    height: 30,
    top: -15,
  },
  callout: {
    width: 180,
  },
  calloutSubview: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  calloutTextContainer: {
    paddingRight: 10,
  },
  calloutText1: {
    ...theme.styles.textSmall,
    ...theme.styles.textBold,
  },
  calloutText2: {
    ...theme.styles.textTiny,
  },
}));

export default LocationsMapScreen;
