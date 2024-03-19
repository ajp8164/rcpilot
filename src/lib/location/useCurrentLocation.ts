import { GeoPositionContext, defaultGeoPosition, distanceBetweenLocations } from 'lib/location';
import { GeolocationError, GeolocationResponse } from '@react-native-community/geolocation/js/';
import { Location, LocationCoords } from 'realmdb/Location';
import { useEffect, useState } from 'react';

import Geolocation from '@react-native-community/geolocation';
import { saveCurrentLocation } from 'store/slices/location';
import { useDispatch } from 'react-redux';
import { useQuery } from '@realm/react';

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
  const dispatch = useDispatch();
  const allLocations = useQuery(Location);

  const [currentPosition, setCurrentPosition] = useState<GeoPositionContext>(defaultGeoPosition);

  useEffect(() => {
    const onWatch = (response: GeolocationResponse) => {
      const coords = {
        latitude: response.coords.latitude,
        longitude: response.coords.longitude,
      } as LocationCoords;

      setCurrentPosition({ coords });
      allLocations.forEach(location => {
        const dist = distanceBetweenLocations(coords, location.coords);
        if (dist.mi < 0.5) {
          dispatch(saveCurrentLocation({ locationId: location._id.toString() }));
          return;
        }
      });
    };

    const onWatchError = (e: GeolocationError) => {
      setCurrentPosition({
        coords: currentPosition.coords,
        error: {
          code: errorCode[e.code],
          message: e.message,
        } as PositionError,
      });
    };

    const watchId = Geolocation.watchPosition(onWatch, onWatchError, {});
    return () => {
      Geolocation.clearWatch(watchId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLocations]);

  return currentPosition;
};
