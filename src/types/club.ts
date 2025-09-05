export type Club = {
  id: string;
  name: string;
  briefDescription: string;
  websiteUrl: string;
  location: string;
  keyFeatures: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  latitude: number;
  longitude: number;
  amaChartered: boolean;
  driving: boolean;
  flying: boolean;
  boating: boolean;
};
