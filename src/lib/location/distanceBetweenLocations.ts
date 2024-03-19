import { LocationCoords } from 'realmdb';

export const distanceBetweenLocations = (coordsA: LocationCoords, coordsB: LocationCoords) => {
  const R = 6371; //  Earth distance in km so it will return the distance in km
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((coordsB.latitude - coordsA.latitude) * p) / 2 +
    (c(coordsA.latitude * p) *
      c(coordsB.latitude * p) *
      (1 - c((coordsB.longitude - coordsA.longitude) * p))) /
      2;
  const km = 2 * R * Math.asin(Math.sqrt(a));
  return {
    km,
    mi: km / 1.609344,
  };
};
