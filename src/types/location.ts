export enum SearchScope {
  ActivityType,
  FullText,
}

export type SearchCriteria = {
  text: string;
  scope: SearchScope;
};
