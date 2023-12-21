export enum SearchScope {
  ActivityType,
  FullText,
}

export type SearchCriteria = {
  text: string;
  scope: SearchScope;
};

export type LocationPosition = {
  latitude: number;
  longitude: number;
};

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
