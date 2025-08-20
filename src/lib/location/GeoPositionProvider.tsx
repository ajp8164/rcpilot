import { ReactNode, createContext } from 'react';

import { LocationCoords } from 'realmdb';

import { PositionError, useCurrentLocation } from '.';

export const defaultGeoPosition = {
  coords: {
    latitude: 0,
    longitude: 0,
  } as LocationCoords,
};

export type GeoPositionContext = {
  coords: LocationCoords;
  error?: PositionError;
};

export const GeoPositionContext =
  createContext<GeoPositionContext>(defaultGeoPosition);

export const GeoPositionProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const currentPosition = useCurrentLocation();
  return (
    <GeoPositionContext.Provider value={currentPosition}>
      {children}
    </GeoPositionContext.Provider>
  );
};
