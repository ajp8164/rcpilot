import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { makeStyles } from '@rn-vui/themed';
import { LocationPickerResult } from 'components/LocationsScreen';
import ActionBar from 'components/atoms/ActionBar';
import { Button } from 'components/atoms/Button';
import { MapMarkerCallout } from 'components/molecules/MapMarkerCallout';
import { appConfig } from 'config';
import { useEvent } from 'lib/event';
import { GeoPositionContext } from 'lib/location';
import { uuidv4 } from 'lib/utils';
import {
  BookOpen,
  Map,
  MapPinPlus,
  MapPinned,
  Navigation,
  Navigation2,
  Satellite,
} from 'lucide-react-native';
import { DateTime } from 'luxon';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Alert, View } from 'react-native';
import MapView, {
  Camera,
  Details,
  MapMarker,
  MapType,
  MarkerDragStartEndEvent,
  MarkerPressEvent,
  Region,
} from 'react-native-maps';
import { useSelector } from 'react-redux';
import { Location, LocationCoords } from 'realmdb/Location';
import { selectLocation } from 'store/selectors/locationSelectors';
import { AppTheme, useTheme } from 'theme';
import { LocationNavigatorParamList } from 'types/navigation';

enum RecenterButtonState {
  Initial,
  CurrentLocation,
  CurrentLocationNorthUp,
}

type MapMarkerLocation = {
  mapMarker: MapMarker;
  location: Location;
};

export type LocationsMapResult = {
  locationId: string;
};

export type Props = NativeStackScreenProps<
  LocationNavigatorParamList,
  'LocationsMap'
>;

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
  let initialLocation = locations.find(
    location => location._id.toString() === locationId,
  );

  const currentLocationId = useSelector(selectLocation).locationId;
  if (!initialLocation) {
    // Get closest the location closest to our current position.
    // Note: Current location is set using a radius around our current position.
    initialLocation = locations.find(
      l => l._id.toString() === currentLocationId,
    );
  }

  const initialized = useRef(false);
  const mapViewRef = useRef<MapView>(null);
  const markersRef = useRef<MapMarkerLocation[]>([]);
  const mapLocation = useRef({
    latitude: currentPosition.coords.latitude,
    longitude: currentPosition.coords.longitude,
  } as LocationCoords);

  const [mapPresentation, setMapPresentation] = useState<MapType>('standard');
  const [recenterButtonState, setRecenterButtonState] = useState(
    RecenterButtonState.Initial,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<BookOpen color={theme.colors.screenHeaderButtonText} />}
            onPress={() =>
              navigation.navigate('Locations', { eventName: 'map-location' })
            }
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
    // Position the map at the user selected location.
    const newLocation = locations.find(
      l => l._id.toString() === result.locationId,
    );

    if (newLocation) {
      recenterMap(newLocation.coords);

      // Find and show the location callout.
      const marker = markersRef.current.find(
        m => m.location.name === newLocation.name,
      );

      if (marker) {
        marker.mapMarker.showCallout();
      }

      // Broadcast the new location.
      if (eventName) {
        event.emit(eventName, {
          locationId: newLocation._id.toString(),
        } as LocationsMapResult);
      }
    }
  };

  const changeRecenter = (coords: LocationCoords) => {
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
    recenterMap(coords, { heading });
  };

  const recenterMap = (coords: LocationCoords, opts?: { heading?: number }) => {
    const partialCamera: Partial<Camera> = {
      center: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      heading: opts?.heading,
      pitch: 0,
      zoom: 1,
    };
    // This is a hack to get the map to center on the specified location.
    // The first call only bring the location into the view.
    // The second call will bring the location to the center of the screen.
    mapViewRef.current?.animateCamera(partialCamera);
    setTimeout(() => {
      mapViewRef.current?.animateCamera(partialCamera);
    });
  };

  const toggleMapPresenation = () => {
    switch (mapPresentation) {
      case 'standard':
        setMapPresentation('satellite');
        break;
      case 'satellite':
        setMapPresentation('standard');
        break;
    }
  };

  const addLocation = () => {
    const now = DateTime.now().toISO();
    const id = uuidv4();
    let newLocation: Location | undefined;

    realm.write(() => {
      newLocation = realm.create(Location, {
        createdOn: now,
        updatedOn: now,
        name: 'Location-' + id.substring(id.length - 5),
        coords: mapLocation.current,
        notes: '',
      });
    });

    if (newLocation && eventName) {
      event.emit(eventName, {
        locationId: newLocation._id.toString(),
      } as LocationsMapResult);
    }

    // When a new location is added by dropping a pin the markersRef array length changes.
    // Show the callout for only the new location.
    setTimeout(() => {
      markersRef.current.forEach(marker => {
        marker.mapMarker.hideCallout();
      });
      markersRef.current[
        markersRef.current.length - 1
      ]?.mapMarker.showCallout();
    }, 500); // Add for UX.
  };

  const onRegionChangeComplete = (region: Region, _details: Details) => {
    mapLocation.current = {
      latitude: region.latitude,
      longitude: region.longitude,
    } as LocationCoords;
  };

  const onMarkerDragEnd = (
    event: MarkerDragStartEndEvent,
    location: Location,
  ) => {
    realm.write(() => {
      location.coords.latitude = event.nativeEvent.coordinate.latitude;
      location.coords.longitude = event.nativeEvent.coordinate.longitude;
    });
  };

  const onMarkerPress = (markerEvent: MarkerPressEvent) => {
    if (eventName) {
      event.emit(eventName, {
        locationId: markerEvent.nativeEvent.id,
      } as LocationsMapResult);
    }
  };

  const renderMapMarkers = (): React.ReactElement[] => {
    return locations.map((location, index) => {
      if (!markersRef.current[index]) {
        markersRef.current[index] = {} as MapMarkerLocation;
      }
      return (
        <MapMarkerCallout
          ref={ref => {
            // Wait to be sure this component is mounted and has a ref.
            setTimeout(() => {
              ref ? (markersRef.current[index].mapMarker = ref) : null;
              markersRef.current[index].location = location;

              // During view initialization the initial location shoudl show it's callout.
              if (!initialized.current) {
                setTimeout(() => {
                  if (
                    location._id.toString() === initialLocation?._id.toString()
                  ) {
                    markersRef.current[index].mapMarker.showCallout();
                    initialized.current = true;
                  }
                }, 500); // For UX
              }
            });
          }}
          key={index}
          index={index}
          location={location}
          onMarkerDragEnd={onMarkerDragEnd}
          onPressCallout={() =>
            navigation.navigate('LocationEditor', {
              locationId: location._id.toString(),
            })
          }
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
        mapType={mapPresentation}
        initialRegion={{
          latitude:
            initialLocation?.coords.latitude || currentPosition.coords.latitude,
          longitude:
            initialLocation?.coords.longitude ||
            currentPosition.coords.longitude,
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
            ActionComponent:
              recenterButtonState === RecenterButtonState.Initial ? (
                <Navigation color={theme.colors.clearButtonText} />
              ) : recenterButtonState ===
                RecenterButtonState.CurrentLocation ? (
                <MapPinned color={theme.colors.clearButtonText} />
              ) : (
                <View style={s.northUp}>
                  <Navigation2 color={theme.colors.white} size={18} />
                </View>
              ),
            onPress: () => changeRecenter(currentPosition.coords),
          },
          {
            ActionComponent: (
              <MapPinPlus color={theme.colors.clearButtonText} />
            ),
            onPress: addLocation,
          },
          {
            ActionComponent:
              mapPresentation === 'standard' ? (
                <Map color={theme.colors.clearButtonText} />
              ) : (
                <Satellite color={theme.colors.clearButtonText} />
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
  northUp: {
    backgroundColor: theme.colors.clearButtonText,
    borderRadius: 5,
    padding: 3,
  },
}));

export default LocationsMapScreen;
