import { LocationCoords } from 'realmdb';
import { PositionError } from 'lib/location';
import { createContext } from 'react';

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
