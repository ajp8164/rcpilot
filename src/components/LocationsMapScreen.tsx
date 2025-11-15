import React, { useContext, useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import MapView, {
  Camera,
  Details,
  MapPressEvent,
  MapType,
  MarkerDragStartEndEvent,
  MapMarker as RNMapMarker,
  Region,
} from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { LocationBottomSheet } from 'components/bottomSheets/LocationBottomSheet';
import { MapBottomSheet } from 'components/bottomSheets/MapBottomSheet';
import { MapMarker } from 'components/molecules/MapMarker';
import { appConfig } from 'config';
import { GeoPositionContext } from 'lib/location';
import { uuidv4 } from 'lib/utils';
import {
  CircleX,
  LayoutList,
  Map,
  MapPinPlus,
  Navigation2,
  Navigation,
  Satellite,
} from 'lucide-react-native';
import { DateTime } from 'luxon';
import { Location, LocationCoords } from 'realmdb/Location';
import { selectMapPreferences } from 'store/selectors/appSettingsSelectors';
import { saveMapPreferences } from 'store/slices/appSettings';
import { LocationPickerResult } from 'types/location';
import { LocationNavigatorParamList } from 'types/navigation';

type MapMarkerLocation = {
  mapMarker: RNMapMarker;
  location: Location;
};

export type Props = NativeStackScreenProps<
  LocationNavigatorParamList,
  'LocationsMap'
>;

const LocationsMapScreen = ({ navigation, route }: Props) => {
  const {
    enableLocationSelection = true,
    eventName,
    locationId,
  } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const event = useEvent();
  const realm = useRealm();
  const dispatch = useDispatch();

  const locations = useQuery(Location);

  // If an initial location is specified from the caller then use that location. If no initial
  // location is specified then use an available closest location to our current position. Failing
  // to get any location record just set the map to our current position.
  const currentPosition = useContext(GeoPositionContext);
  const initialLocation = locations.find(
    location => location._id.toString() === locationId,
  );

  // This is the current selection by the user.
  const userTappedLocationId = useRef<string>(null);

  const initialized = useRef(false);
  const mapViewRef = useRef<MapView>(null);
  const markersRef = useRef<MapMarkerLocation[]>([]);
  const mapLocation = useRef({
    latitude: currentPosition.coords.latitude,
    longitude: currentPosition.coords.longitude,
  } as LocationCoords);

  const mapPreferences = useSelector(selectMapPreferences);
  const [mapPresentation, setMapPresentation] = useState<MapType>(
    mapPreferences.presentation,
  );
  const [mapIsCentered, setMapIsCentered] = useState(true);
  const [mapIsRotated, setMapIsRotated] = useState(false);

  const mapBottomSheetRef = useRef<MapBottomSheet>(null);
  const locationBottomSheetRef = useRef<LocationBottomSheet>(null);

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

  useEffect(() => {
    dispatch(
      saveMapPreferences({ preferences: { presentation: mapPresentation } }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapPresentation]);

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

      event.emit('map-location', {
        locationId: newLocationId,
      } as LocationPickerResult);

      userTappedLocationId.current = newLocationId;
    }
  };

  const recenterMap = (coords: LocationCoords) => {
    const partialCamera: Partial<Camera> = {
      center: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
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

    setMapIsCentered(true);
  };

  const northUpMap = () => {
    const partialCamera: Partial<Camera> = {
      heading: 0,
      pitch: 0,
      zoom: 1,
    };

    mapViewRef.current?.animateCamera(partialCamera);
    setTimeout(() => {
      mapViewRef.current?.animateCamera(partialCamera);
    });

    setMapIsRotated(false);
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

  const addLocation = (coords?: LocationCoords) => {
    const now = DateTime.now().toISO();
    const id = uuidv4();
    let newLocation: Location | undefined;

    realm.write(() => {
      newLocation = realm.create(Location, {
        createdOn: now,
        updatedOn: now,
        name: 'Location-' + id.substring(id.length - 5),
        coords: coords || mapLocation.current,
        notes: '',
      });
    });

    if (newLocation) {
      const newLocationId = newLocation._id.toString();

      // When a new location is added by dropping a pin the markersRef array length changes.
      // Show the callout for only the new location.
      setTimeout(() => {
        markersRef.current.forEach(marker => {
          marker.mapMarker?.hideCallout();
        });
        markersRef.current[
          markersRef.current.length - 1
        ]?.mapMarker?.showCallout();
      }, 500); // Add for UX.

      // Show location bottom sheet for the new location.
      mapBottomSheetRef.current?.dismiss();
      requestAnimationFrame(() => {
        locationBottomSheetRef.current?.present(newLocationId, 0, true);
      });

      // Update our user selection.
      event.emit('map-location', {
        locationId: newLocationId,
      } as LocationPickerResult);

      userTappedLocationId.current = newLocationId;
    }
  };

  const onRegionChangeComplete = (region: Region, _details: Details) => {
    mapLocation.current = {
      latitude: region.latitude,
      longitude: region.longitude,
    } as LocationCoords;
  };

  const setUserMovedMap = async () => {
    setMapIsCentered(false);
  };

  const checkUserRotatedMap = async () => {
    const camera = await mapViewRef.current?.getCamera();
    setMapIsRotated(camera?.heading !== 0);
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
    // This check allows the location sheet to be dismissed if it is currently displayed and
    // the user has tapped a marker other than the marker for the currently displayed location
    // sheet. This effectively allows the location sheet to be dismissed as through a tap occurred
    // anywhere on the map outside of the displatyed location.
    const presentedLocationId = locationBottomSheetRef.current?.getLocationId();
    if (presentedLocationId && presentedLocationId !== locationId) {
      locationBottomSheetRef.current?.dismiss();
    }
  };

  const onPressCallout = (locationId: string) => {
    locationBottomSheetRef.current?.present(locationId);
  };

  const onLocationSelect = (locationId: string) => {
    // Broadcast the users selected location.
    if (enableLocationSelection && eventName) {
      event.emit(eventName, {
        locationId,
      } as LocationPickerResult);
    }

    navigation.goBack();
  };

  const renderActionButtons = (): React.ReactElement => {
    return (
      <>
        <View style={s.buttons}>
          <Button
            containerStyle={[s.button, s.buttonFirst, s.buttonLast]}
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<CircleX color={theme.colors.clearButtonText} size={28} />}
            onPress={() => navigation.goBack()}
          />
          <Button
            containerStyle={[s.button, s.buttonFirst]}
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={
              <Navigation
                color={theme.colors.clearButtonText}
                size={28}
                fill={
                  mapIsCentered
                    ? theme.colors.clearButtonText
                    : theme.colors.transparent
                }
              />
            }
            onPress={() => recenterMap(currentPosition.coords)}
          />
          <Button
            containerStyle={s.button}
            buttonStyle={{
              ...theme.styles.buttonScreenHeader,
              justifyContent: 'center',
              width: 40,
            }}
            icon={
              <>
                <View style={s.northUp} />
                <Navigation2
                  color={theme.colors.clearButtonText}
                  size={24}
                  fill={
                    mapIsRotated
                      ? theme.colors.transparent
                      : theme.colors.clearButtonText
                  }
                />
              </>
            }
            onPress={() => northUpMap()}
          />
          <Button
            containerStyle={[s.button, s.buttonLast]}
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={
              mapPresentation === 'standard' ? (
                <Satellite color={theme.colors.clearButtonText} size={28} />
              ) : (
                <Map color={theme.colors.clearButtonText} size={28} />
              )
            }
            onPress={() => toggleMapPresenation()}
          />
          <Button
            containerStyle={[s.button, s.buttonFirst, s.buttonLast]}
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={
              <MapPinPlus
                color={theme.colors.screenHeaderButtonText}
                size={28}
              />
            }
            onPress={() => addLocation()}
          />
        </View>
        <View style={s.buttonShowList}>
          <Button
            title={'Show List'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            containerStyle={[s.button, s.buttonFirst, s.buttonLast]}
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<LayoutList color={theme.colors.clearButtonText} size={18} />}
            onPress={() => mapBottomSheetRef.current?.present()}
          />
        </View>
      </>
    );
  };

  const renderMapMarkers = (): React.ReactElement[] => {
    return locations.map((location, index) => {
      if (!markersRef.current[index]) {
        markersRef.current[index] = {} as MapMarkerLocation;
      }
      return (
        <MapMarker
          ref={ref => {
            // Wait to be sure this component is mounted and has a ref.
            setTimeout(() => {
              if (ref) markersRef.current[index].mapMarker = ref;
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
        onPanDrag={() => setUserMovedMap()}
        onRegionChangeStart={() => checkUserRotatedMap()}
        onRegionChangeComplete={onRegionChangeComplete}
        onPress={onPressMap}
        onLongPress={e =>
          addLocation(e.nativeEvent.coordinate as LocationCoords)
        }>
        {renderMapMarkers()}
      </MapView>
      {renderActionButtons()}
      <MapBottomSheet
        ref={mapBottomSheetRef}
        onPressAddLocation={addLocation}
      />
      <LocationBottomSheet
        ref={locationBottomSheetRef}
        initialIndex={locationId ? 0 : -1}
        enableSelection={enableLocationSelection}
        onLocationSelect={onLocationSelect}
        onDismiss={byUser => {
          if (byUser) {
            // Re-present the "main" map bottom sheet.
            // mapBottomSheetRef.current?.present();

            // When the bottom sheet is dismissed by the user (close button) then
            // no other marker has been selected so we hide all the markers (includes
            // the marker for the location bottom sheet just closed).
            markersRef.current.forEach(m => m.mapMarker.hideCallout());
          }
        }}
        onPressNotes={(text, title) =>
          navigation.navigate('NotesEditor', {
            title,
            text,
            eventName: 'location-notes',
          })
        }
      />
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme, device }) => ({
  button: {
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomColor: theme.colors.listItemBorder,
    borderBottomWidth: 1,
  },
  buttonFirst: {
    borderTopLeftRadius: theme.radius.M,
    borderTopRightRadius: theme.radius.M,
  },
  buttonLast: {
    borderBottomLeftRadius: theme.radius.M,
    borderBottomRightRadius: theme.radius.M,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  buttonShowList: {
    width: '100%',
    position: 'absolute',
    bottom: 15,
    alignItems: 'center',
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
    borderColor: theme.colors.clearButtonText,
    borderWidth: 1,
    borderRadius: 1,
    width: 2,
    height: 6,
    alignSelf: 'center',
  },
}));

export default LocationsMapScreen;
