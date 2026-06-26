import { ISODateString } from '@react-native-hello/common';

export type Club = {
  id: string;
  addedOn: ISODateString;
  modifiedOn: ISODateString;
  name: string;
  description: string;
  address: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  latitude: number;
  longitude: number;
  websiteUrl: string;
  keyFeatures: string;
  amaChartered: boolean;
  driving: boolean;
  flying: boolean;
  boating: boolean;
};
