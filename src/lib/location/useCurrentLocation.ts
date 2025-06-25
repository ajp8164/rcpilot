import { Collection, CollectionChangeSet } from 'realm';
import {
  GeoPositionContext,
  defaultGeoPosition,
  distanceBetweenLocations,
} from 'lib/location';
import {
  GeolocationError,
  GeolocationResponse,
} from '@react-native-community/geolocation/js/';
import { Location, LocationCoords } from 'realmdb/Location';
import { useEffect, useRef } from 'react';

import Geolocation from '@react-native-community/geolocation';
import { saveCurrentLocation } from 'store/slices/location';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useDispatch } from 'react-redux';
import { useRealm } from '@realm/react';

export type PositionError = {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT';
  message: string;
};

const errorCode: Record<number, string> = {
  1: 'PERMISSION_DENIED',
  2: 'POSITION_UNAVAILABLE',
  3: 'TIMEOUT',
};

export const useCurrentLocation = () => {
  const setDebounced = useDebouncedRender();
  const dispatch = useDispatch();
  const realm = useRealm();

  const currentPosition = useRef<GeoPositionContext>(defaultGeoPosition);

  // Respond to user changes to locations, e.g. pin movement on the map may trigger
  // that we are now within the vicinity of a location (so we should set it as current).
  useEffect(() => {
    const allLocations = realm.objects(Location);
    // @ts-expect-error Can't get listener callback to type properly.
    allLocations.addListener(onLocationCoordsChange, [
      'coords.latitude',
      'coords.longitude',
    ]);

    Geolocation.watchPosition(onWatch, onWatchError, {
      interval: 5 * 60 * 1000, // 5 mins
      enableHighAccuracy: true,
      distanceFilter: 805, // Half mile (in meters)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAndSetCurrentLocation = (coords: LocationCoords) => {
    const allLocations = realm.objects(Location);

    let closest = {
      dist: { km: Infinity, mi: Infinity },
      location: {} as Location,
    };
    allLocations.forEach(location => {
      const dist = distanceBetweenLocations(coords, location.coords);
      if (dist.mi < closest.dist.mi) {
        closest = {
          dist,
          location,
        };
      }
    });

    if (closest.dist.mi < 0.5) {
      dispatch(
        saveCurrentLocation({ locationId: closest.location._id.toString() }),
      );
    } else {
      dispatch(saveCurrentLocation({}));
    }
  };

  const onLocationCoordsChange = (
    _locations: Collection<Location>,
    changes: CollectionChangeSet,
  ) => {
    // Don't consider insertions here since adding location is done on the map and we don't the
    // mape to move (recenter) unexpectedly.
    if (
      changes.deletions.length ||
      changes.insertions.length ||
      changes.newModifications.length ||
      changes.oldModifications.length
    ) {
      checkAndSetCurrentLocation(currentPosition.current.coords);
    }
  };

  // Respond to changes in the position of this device. Low frequency check will
  // assign the current location when criteria is met (radius).
  function onWatch(response: GeolocationResponse) {
    const coords = {
      latitude: response.coords.latitude,
      longitude: response.coords.longitude,
    } as LocationCoords;

    setDebounced(() => (currentPosition.current.coords = coords));
    checkAndSetCurrentLocation(coords);
  }

  function onWatchError(e: GeolocationError) {
    setDebounced(
      () =>
        (currentPosition.current = {
          coords: currentPosition.current.coords,
          error: {
            code: errorCode[e.code],
            message: e.message,
          } as PositionError,
        }),
    );
  }

  return currentPosition.current;
};
