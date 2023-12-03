import { GeolocationResponse } from '@react-native-community/geolocation';
import { LatLng } from 'react-native-maps';

export enum SearchScope {
  ActivityType,
  FullText,
}

export type SearchCriteria = {
  text: string;
  scope: SearchScope;
};

export type LocationPosition = GeolocationResponse;

export type LocationDetail = {
  notes: string;
};

export type Location = {
  id: string;
  name: string;
  description: string;
  position: LocationPosition;
  detail: LocationDetail;
};

export type LocationCollectionSettings = {
  filter: string[];
};
