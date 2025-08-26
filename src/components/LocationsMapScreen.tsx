import React, { useContext, useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import MapView, {
  Camera,
  Details,
  MapMarker,
  MapPressEvent,
  MapType,
  MarkerDragStartEndEvent,
  Region,
} from 'react-native-maps';

import { useEvent } from '@react-native-hello/core';
import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { LocationBottomSheet } from 'components/bottomSheets/LocationBottomSheet';
import { MapBottomSheet } from 'components/bottomSheets/MapBottomSheet';
import { NotesBottomSheet } from 'components/bottomSheets/NotesBottomSheet';
import { MapMarkerCallout } from 'components/molecules/MapMarkerCallout';
import { appConfig } from 'config';
import { GeoPositionContext } from 'lib/location';
import { uuidv4 } from 'lib/utils';
import {
  CircleX,
  Map,
  MapPinPlus,
  MapPinned,
  Navigation2,
  Navigation,
  Satellite,
} from 'lucide-react-native';
import { DateTime } from 'luxon';
import { Location, LocationCoords } from 'realmdb/Location';
import { LocationPickerResult } from 'types/location';
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
  const s = useStyles();
  const event = useEvent();
  const realm = useRealm();

  const locations = useQuery(Location);

  // If an initial location is specified from the caller then use that location. If no initial
  // location is specified then use an available closest location to our current position. Failing
  // to get any location record just set the map to our current position.
  const currentPosition = useContext(GeoPositionContext);
  const initialLocation = locations.find(
    location => location._id.toString() === locationId,
  );

  // This is the current selection by the user.
  const userSelectedLocationId = useRef<string>(null);

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

  const mapBottomSheetRef = useRef<MapBottomSheet>(null);
  const locationBottomSheetRef = useRef<LocationBottomSheet>(null);
  const notesBottomSheetRef = useRef<NotesBottomSheet>(null);

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
    if (locationId) {
      onChangeMapLocation({ locationId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    event.on('select-map-location', onChangeMapLocation);
    return () => {
      event.removeListener('select-map-location', onChangeMapLocation);
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

      // Show the bottom sheet for the new location.
      mapBottomSheetRef.current?.dismiss();
      locationBottomSheetRef.current?.present(result.locationId);

      // Find and show the location callout.
      const marker = markersRef.current.find(
        m => m.location?.name === newLocation.name,
      );

      if (marker) {
        marker.mapMarker.showCallout();
      }

      const newLocationId = newLocation._id.toString();

      // Broadcast the new location.
      if (eventName) {
        event.emit(eventName, {
          locationId: newLocationId,
        } as LocationsMapResult);
      }

      event.emit('map-location', {
        locationId: newLocationId,
      } as LocationsMapResult);

      userSelectedLocationId.current = newLocationId;
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

    if (newLocation) {
      const newLocationId = newLocation._id.toString();

      if (eventName) {
        event.emit(eventName, {
          locationId: newLocationId,
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

      // Show location bottom sheet for the new location.
      mapBottomSheetRef.current?.dismiss();
      requestAnimationFrame(() => {
        locationBottomSheetRef.current?.present(newLocationId);
      });

      // Update our user selection.
      event.emit('map-location', {
        locationId: newLocationId,
      } as LocationsMapResult);

      userSelectedLocationId.current = newLocationId;
    }
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

  const onPressMap = (event: MapPressEvent) => {
    // Perform only if press is not on a marker.
    if (event.nativeEvent.action === 'press') {
      locationBottomSheetRef.current?.dismiss(true);
    }
  };

  const onPressMarker = (locationId: string) => {
    if (locationId !== userSelectedLocationId.current) {
      onChangeMapLocation({ locationId });

      mapBottomSheetRef.current?.dismiss();
      requestAnimationFrame(() => {
        locationBottomSheetRef.current?.present(locationId);
      });
    }
  };

  const onPressCallout = (_locationId: string) => {};

  const renderActionButtons = (): React.ReactElement => {
    return (
      <View style={s.buttons}>
        <Button
          containerStyle={s.button}
          buttonStyle={theme.styles.buttonScreenHeader}
          icon={<CircleX color={theme.colors.lightGray} size={28} />}
          onPress={() => navigation.goBack()}
        />
        <Button
          containerStyle={[s.button, s.buttonFirst]}
          buttonStyle={theme.styles.buttonScreenHeader}
          icon={
            <>
              {recenterButtonState === RecenterButtonState.Initial ? (
                <Navigation color={theme.colors.clearButtonText} size={28} />
              ) : recenterButtonState ===
                RecenterButtonState.CurrentLocation ? (
                <MapPinned color={theme.colors.clearButtonText} size={28} />
              ) : (
                <View style={s.northUp}>
                  <Navigation2 color={theme.colors.white} size={28} />
                </View>
              )}
            </>
          }
          onPress={() => changeRecenter(currentPosition.coords)}
        />
        <Button
          containerStyle={[s.button, s.buttonLast]}
          buttonStyle={theme.styles.buttonScreenHeader}
          icon={
            mapPresentation === 'standard' ? (
              <Map color={theme.colors.clearButtonText} size={28} />
            ) : (
              <Satellite color={theme.colors.clearButtonText} size={28} />
            )
          }
          onPress={() => toggleMapPresenation()}
        />
        <Button
          containerStyle={s.button}
          buttonStyle={theme.styles.buttonScreenHeader}
          icon={
            <MapPinPlus color={theme.colors.screenHeaderButtonText} size={28} />
          }
          onPress={() => addLocation()}
        />
      </View>
    );
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

              // During view initialization the initial location should show it's callout.
              if (!initialized.current) {
                setTimeout(() => {
                  if (
                    location._id.toString() === initialLocation?._id.toString()
                  ) {
                    markersRef.current[index].mapMarker.showCallout();

                    locationBottomSheetRef.current?.present(
                      location._id.toString(),
                    );
                    requestAnimationFrame(() => {
                      mapBottomSheetRef.current?.dismiss();
                    });

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
          onPressMarker={() => {
            onPressMarker(location._id.toString());
          }}
          onPressCallout={() => {
            onPressCallout(location._id.toString());
          }}
        />
      );
    });
  };

  return (
    <>
      <MapView
        ref={mapViewRef}
        style={s.map}
        showsUserLocation={true}
        mapType={mapPresentation}
        userInterfaceStyle={ThemeManager.name}
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
        onPress={onPressMap}>
        {renderMapMarkers()}
      </MapView>
      {renderActionButtons()}
      <MapBottomSheet
        ref={mapBottomSheetRef}
        initialIndex={locationId ? -1 : undefined}
      />
      <LocationBottomSheet
        ref={locationBottomSheetRef}
        onDismiss={byUser => {
          if (byUser) {
            // Re-present the "main" map bottom sheet.
            mapBottomSheetRef.current?.present();

            // When the bottom sheet is dismissed by the user (close button) then
            // no other marker has been selected so we hide all the markers (includes
            // the marker for the location bottom sheet just closed).
            markersRef.current.forEach(m => m.mapMarker.hideCallout());
          }
        }}
        onPressNotes={(text, title) =>
          notesBottomSheetRef.current?.present(text, title)
        }
      />
      <NotesBottomSheet
        ref={notesBottomSheetRef}
        eventName={'location-notes'}
      />
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme, device }) => ({
  button: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.white,
  },
  buttonFirst: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: theme.colors.listItemBorder,
    borderBottomWidth: 1,
    marginTop: 10,
  },
  buttonLast: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginBottom: 10,
  },
  buttons: {
    position: 'absolute',
    top: device.insets.top,
    right: 15,
  },
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
