
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import MapView, {
  Camera,
  Details,
  MapType,
  MarkerDragStartEndEvent,
  MapMarker as RNMapMarker,
  Region,
} from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import { ThemeManager, useDevice } from '@react-native-hello/ui';
import { GlassBackButton } from 'components/atoms/navigation/GlassBackButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { ClubBottomSheet } from 'components/bottomSheets/ClubBottomSheet';
import { ClubsBottomSheet } from 'components/bottomSheets/ClubsBottomSheet';
import { LocationBottomSheet } from 'components/bottomSheets/LocationBottomSheet';
import { MapBottomSheet } from 'components/bottomSheets/MapBottomSheet';
import { MapMarker } from 'components/molecules/MapMarker';
import { useMapSheetOrchestration } from 'components/hooks/useMapSheetOrchestration';
import MapActionButtons from 'components/molecules/MapActionButtons';
import { appConfig } from 'config';
import { GeoPositionContext } from 'lib/location';
import { uuidv4 } from 'lib/utils';
import { DateTime } from 'luxon';
import { Location, LocationCoords } from 'realmdb/Location';
import { Club } from 'realmdb/Club';
import { BSON } from 'realm';
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

  const s = useStyles();
  const device = useDevice();
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
  const [markerRevision, setMarkerRevision] = useState(0);

  const mapBottomSheetRef = useRef<MapBottomSheet>(null);
  const clubsBottomSheetRef = useRef<ClubsBottomSheet>(null);
  const clubBottomSheetRef = useRef<ClubBottomSheet>(null);
  const locationBottomSheetRef = useRef<LocationBottomSheet>(null);

  const {
    sheetMode,
    mapSheetUserIndex,
    bottomSheetPosition,
    locationSheetPosition,
    clubSheetPosition,
    buttonTrackingPosition,
    setSheetMode,
    onMapSheetSnapChange,
    onClubBottomSheetDismiss,
    onClubsBottomSheetDismiss,
  } = useMapSheetOrchestration({ mapBottomSheetRef, clubsBottomSheetRef, clubBottomSheetRef });

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
      setSheetMode({ type: 'location_detail', mapSnapIndex: mapSheetUserIndex.current });
      mapBottomSheetRef.current?.snapToIndex(0);
      locationBottomSheetRef.current?.present(result.locationId);

      // Find and show the location callout.
      const marker = markersRef.current.find(
        m => m.location?.name === newLocation.name,
      );

      if (marker) {
        marker.mapMarker?.showCallout();
      }

      const newLocationId = newLocation._id.toString();

      event.emit('map-location', {
        locationId: newLocationId,
      } as LocationPickerResult);

      userTappedLocationId.current = newLocationId;
    }
  };

  const recenterMap = async (coords: LocationCoords) => {
    // Get current map boundaries to calculate the visible latitude span.
    const boundaries = await mapViewRef.current?.getMapBoundaries();
    const latDelta = boundaries
      ? boundaries.northEast.latitude - boundaries.southWest.latitude
      : 0.01;

    // Offset the center southward so the pin appears at ~30% from top
    // regardless of zoom level.
    const offsetLat = coords.latitude - latDelta * 0.25;

    const partialCamera: Partial<Camera> = {
      center: {
        latitude: offsetLat,
        longitude: coords.longitude,
      },
      pitch: 0,
      zoom: 1,
    };

    mapViewRef.current?.animateCamera(partialCamera);
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

  const addLocation = async (coords?: LocationCoords) => {
    const now = DateTime.now().toISO();
    const id = uuidv4();
    let newLocation: Location | undefined;

    // When no coords provided (button press), place the pin at the visual
    // center point (above map center, matching recenterMap offset).
    let pinCoords = coords;
    if (!pinCoords) {
      const boundaries = await mapViewRef.current?.getMapBoundaries();
      const latDelta = boundaries
        ? boundaries.northEast.latitude - boundaries.southWest.latitude
        : 0.01;
      pinCoords = {
        latitude: mapLocation.current.latitude + latDelta * 0.25,
        longitude: mapLocation.current.longitude,
      } as LocationCoords;
    }

    realm.write(() => {
      newLocation = realm.create(Location, {
        createdOn: now,
        updatedOn: now,
        name: 'Location-' + id.substring(id.length - 5),
        kind: 'user',
        coords: pinCoords!,
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

      // Dismiss any open detail/search sheets and show location editor.
      setSheetMode({ type: 'adding_location', mapSnapIndex: mapSheetUserIndex.current });
      clubBottomSheetRef.current?.dismiss();
      clubsBottomSheetRef.current?.dismiss(false);
      mapBottomSheetRef.current?.snapToIndex(0);
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

  const onPressClubs = () => {
    setSheetMode({ type: 'clubs_search', mapSnapIndex: mapSheetUserIndex.current });
    mapBottomSheetRef.current?.snapToIndex(0);
    setTimeout(() => {
      clubsBottomSheetRef.current?.present();
    }, 200);
  };

  const onPressRecentLocation = (locationId: string, kind: string) => {
    const loc = locations.find(l => l._id.toString() === locationId);
    if (!loc) return;

    recenterMap(loc.coords);
    presentLocationDetail(locationId, kind, loc);
  };

  // Presents the appropriate detail sheet for the given location.
  const presentLocationDetail = (locationId: string, kind: string, loc: Location) => {
    setSheetMode({ type: 'location_detail', mapSnapIndex: mapSheetUserIndex.current });
    mapBottomSheetRef.current?.snapToIndex(0);

    if (kind === 'club') {
      const club = realm
        .objects(Club)
        .filtered('location._id == $0', loc._id)[0];
      if (club) {
        setSheetMode({ type: 'club_detail', source: 'callout', mapSnapIndex: mapSheetUserIndex.current, clubsSnapIndex: 0 });
        clubBottomSheetRef.current?.present(club._id.toString());
      }
    } else {
      locationBottomSheetRef.current?.present(locationId);
    }
  };

  const onPressClub = (clubId: string) => {
    const clubsSnapIndex = clubsBottomSheetRef.current?.getCurrentIndex() ?? 1;
    setSheetMode({ type: 'club_detail', source: 'search', mapSnapIndex: mapSheetUserIndex.current, clubsSnapIndex });
    clubsBottomSheetRef.current?.dismiss(false);
    requestAnimationFrame(() => {
      clubBottomSheetRef.current?.present(clubId);
    });

    // Recenter map on the club's location.
    const club = realm.objectForPrimaryKey(Club, new BSON.ObjectId(clubId));
    if (club?.location?.coords) {
      recenterMap(club.location.coords);
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
    const { latitude, longitude } = event.nativeEvent.coordinate;

    Alert.alert(
      'Move Location',
      `Move "${location.name}" to new position?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setMarkerRevision(prev => prev + 1);
          },
        },
        {
          text: 'Move',
          style: 'destructive',
          onPress: () => {
            realm.write(() => {
              location.coords.latitude = latitude;
              location.coords.longitude = longitude;
            });
          },
        },
      ],
    );
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

  const onPressCallout = (location: Location) => {
    presentLocationDetail(location._id.toString(), location.kind, location);
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

  // Stable callbacks for MapActionButtons (avoids re-renders from new references).
  const handleAddLocation = useCallback(() => addLocation(), []);
  const handleRecenter = useCallback(
    () => recenterMap(currentPosition.coords),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPosition.coords],
  );

  const mapMarkers = useMemo(() => {
    return locations.map((location, index) => {
      const locationId = location._id.toString();

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
                  if (locationId === initialLocation?._id.toString()) {
                    markersRef.current[index].mapMarker?.showCallout();

                    setSheetMode({ type: 'location_detail', mapSnapIndex: mapSheetUserIndex.current });
                    mapBottomSheetRef.current?.snapToIndex(0);
                    locationBottomSheetRef.current?.present(locationId);

                    initialized.current = true;
                  }
                }, 500); // For UX
              }
            });
          }}
          key={`${index}-${markerRevision}`}
          index={index}
          location={location}
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          onMarkerDragEnd={onMarkerDragEnd}
          onPressMarker={() => {
            onPressMarker(location._id.toString());
          }}
          onPressCallout={() => {
            onPressCallout(location);
          }}
        />
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, markerRevision]);

  return (
    <>
      <ClusteredMapView
        ref={mapViewRef}
        style={s.map}
        showsUserLocation={true}
        mapType={mapPresentation}
        userInterfaceStyle={ThemeManager.name}
        // Offset the map center southward so the user's location appears at ~30%
        // from the top of the screen rather than dead center. This accounts for the
        // bottom sheet covering the lower 40% of the screen on load. The factor 0.349
        // is calibrated to match recenterMap() which uses actual map boundaries; minor
        // per-device variance (~2-5px) is expected due to aspect ratio differences.
        initialRegion={{
          latitude:
            (initialLocation?.coords.latitude || currentPosition.coords.latitude) -
            (currentPosition.error ? 10 : 0.01) * 0.349,
          longitude:
            initialLocation?.coords.longitude ||
            currentPosition.coords.longitude,
          latitudeDelta: currentPosition.error ? 10 : 0.01,
          longitudeDelta: currentPosition.error ? 10 : 0.01,
        }}
        onPanDrag={() => setUserMovedMap()}
        onRegionChangeStart={() => checkUserRotatedMap()}
        onRegionChangeComplete={onRegionChangeComplete}
        onLongPress={e =>
          addLocation(e.nativeEvent.coordinate as LocationCoords)
        }>
        {mapMarkers}
      </ClusteredMapView>
      <MapActionButtons
        animatedPosition={buttonTrackingPosition}
        mapIsCentered={mapIsCentered}
        mapIsRotated={mapIsRotated}
        mapPresentation={mapPresentation}
        onAddLocation={handleAddLocation}
        onRecenter={handleRecenter}
        onNorthUp={northUpMap}
        onTogglePresentation={toggleMapPresenation}
      />
      <GlassBackButton
        onPress={() => navigation.getParent()?.goBack()}
      />
      <MapBottomSheet
        ref={mapBottomSheetRef}
        animatedPosition={bottomSheetPosition}
        initialIndex={1}
        topInset={device.insets.top}
        onPressAddLocation={addLocation}
        onPressClubs={onPressClubs}
        onPressRecentLocation={onPressRecentLocation}
        onSnapChange={onMapSheetSnapChange}
      />
      <ClubsBottomSheet
        ref={clubsBottomSheetRef}
        onDismiss={onClubsBottomSheetDismiss}
        onPressClub={onPressClub}
      />
      <ClubBottomSheet
        ref={clubBottomSheetRef}
        animatedPosition={clubSheetPosition}
        onDismiss={onClubBottomSheetDismiss}
      />
      <LocationBottomSheet
        ref={locationBottomSheetRef}
        animatedPosition={locationSheetPosition}
        initialIndex={locationId ? 0 : -1}
        enableSelection={enableLocationSelection}
        onLocationSelect={onLocationSelect}
        onDismiss={byUser => {
          if (byUser) {
            markersRef.current.forEach(m => m.mapMarker?.hideCallout());
          }
          const mode = sheetMode.current;
          const mapSnapIndex = (mode.type === 'location_detail' || mode.type === 'adding_location')
            ? mode.mapSnapIndex
            : mapSheetUserIndex.current;
          setSheetMode({ type: 'idle' });
          mapBottomSheetRef.current?.snapToIndex(mapSnapIndex);
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

const useStyles = ThemeManager.createStyleSheet(() => ({
  map: {
    width: '100%',
    height: '100%',
  },
}));

export default LocationsMapScreen;
