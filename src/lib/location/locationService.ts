import { Location, LocationPosition } from 'types/location';
import { log, useSetState } from '@react-native-ajp-elements/core';

import Geolocation from '@react-native-community/geolocation';
import { useEffect } from 'react';
// import { useSelector } from 'react-redux';
import { uuidv4 } from 'lib/utils';

// import {
//   selectAllLocations,
//   selectLocation,
// } from 'store/selectors/locationSelectors';

export const createNewLocation = (position: LocationPosition) => {
  const id = uuidv4();
  const location: Location = {
    id,
    name: 'Location-' + id.substring(id.length - 5),
    description: 'No events',
    position,
    detail: {
      notes: '',
    },
  };
  return location;
};

const getCurrentPosition = (): Promise<LocationPosition> => {
  return new Promise(function (resolve, reject) {
    Geolocation.getCurrentPosition(response => {
      resolve({
        latitude: response.coords.latitude,
        longitude: response.coords.longitude,
      });
    }, reject);
  });
};

export type LocationResponse = {
  data: Location;
  loading: boolean;
};

export const useLocation = (locationId?: string): LocationResponse => {
  console.log('USE GET LOCATION');
  const [state, setState] = useSetState({
    data: {} as Location,
    loading: true,
  });

  const allLocations: Location[] = []; //  useSelector(selectAllLocations);
  let location: Location | undefined = undefined;  //useSelector(selectLocation(locationId || ''));

  useEffect(() => {
    console.log('USE GET LOCATION - USE EFFECT');
    if (location) {
      setState({ loading: false, data: location });
    } else {
      // Search location database for location within a defined radius.
      // If no known location is found then create a new location.
      console.log('USE GET LOCATION - ABOUT TO GET CURRENT POSITION');
      getCurrentPosition()
        .then(position => {
          console.log(position);
          let _location;
          allLocations.forEach(loc => {
            const dist = getDistanceBetween(position, loc.position);
            console.log(dist);
            if (dist.mi < 0.5) {
              console.log('USE GET LOCATION - USING EXISTING LOCATION');
              _location = loc;
              return;
            }
          });
          if (!_location) {
            console.log('USE GET LOCATION - CREATING NEW LOCATION');
            _location = createNewLocation(position);
          }
          setState({ loading: false, data: _location });
        })
        .catch(error => {
          setState({ loading: false });
          log.warn('Could not get current geo position', error);
        });
    }
  // }, [allLocations, location, setState]);
  }, []);

  console.log(JSON.stringify(state));

  return state;
};

export const getDistanceBetween = (
  position1: LocationPosition,
  position2: LocationPosition,
) => {
  const R = 6371; //  Earth distance in km so it will return the distance in km
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((position2.latitude - position1.latitude) * p) / 2 +
    (c(position1.latitude * p) *
      c(position2.latitude * p) *
      (1 - c((position2.longitude - position1.longitude) * p))) /
      2;
  const km = 2 * R * Math.asin(Math.sqrt(a));
  return {
    km,
    mi: km / 1.609344,
  };
};
