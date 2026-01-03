import { ISODateString } from '@react-native-hello/common';

export type Club = {
  id: string;
  addedOn: ISODateString;
  modifiedOn: ISODateString;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
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
