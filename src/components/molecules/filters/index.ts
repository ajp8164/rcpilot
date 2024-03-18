export * from './ListItemFilterBoolean';
export * from './ListItemFilterDate';
export * from './ListItemFilterEnum';
export * from './ListItemFilterNumber';
export * from './ListItemFilterString';

export type FilterState =
  | BooleanFilterState
  | DateFilterState
  | EnumFilterState
  | NumberFilterState
  | StringFilterState;

export type BooleanFilterState = {
  relation: BooleanRelation;
  value: string[];
};

export type DateFilterState = {
  relation: DateRelation;
  value: string[];
};

export type EnumFilterState = {
  relation: EnumRelation;
  value: string[];
};

export type NumberFilterState = {
  relation: NumberRelation;
  value: string[];
};

export type StringFilterState = {
  relation: StringRelation;
  value: string[];
};

export enum BooleanRelation {
  Any = 'Any',
  Yes = 'Yes',
  No = 'No',
}

export enum DateRelation {
  Any = 'Any',
  Before = 'Before',
  After = 'After',
  Past = 'Past',
}

export enum EnumRelation {
  Any = 'Any',
  Is = 'Is',
  IsNot = 'Is Not',
}

export enum NumberRelation {
  Any = 'Any',
  LT = '<',
  GT = '>',
  EQ = '=',
  NE = '!=',
}

export enum StringRelation {
  Any = 'Any',
  Contains = 'Contains',
  Missing = 'Missing',
}

// Type and union of all relations.
export type FilterRelation =
  | BooleanRelation
  | DateRelation
  | EnumRelation
  | NumberRelation
  | StringRelation;

export const FilterRelation = {
  ...BooleanRelation,
  ...DateRelation,
  ...EnumRelation,
  ...NumberRelation,
  ...StringRelation,
};

// Realm Query Language relations mapping.
// Property queries
export const RQL: Record<FilterRelation, string> = {
  [FilterRelation.Any]: '', // Not used. Excluded from queries.
  [FilterRelation.Is]: '== ANY',
  [FilterRelation.IsNot]: '== NONE',
  [FilterRelation.Before]: '>',
  [FilterRelation.After]: '<',
  [FilterRelation.Past]: '>',
  [FilterRelation.LT]: '<',
  [FilterRelation.GT]: '>',
  [FilterRelation.EQ]: '==',
  [FilterRelation.NE]: '!=',
  [FilterRelation.Yes]: '== true',
  [FilterRelation.No]: '== false',
  [FilterRelation.Contains]: '',
  [FilterRelation.Missing]: '-',
};

// Collection queries - only applies to enum relations
export const RQLCol: Record<EnumRelation, string> = {
  [FilterRelation.Any]: '', // Not used. Excluded from queries.
  [FilterRelation.Is]: 'SOME',
  [FilterRelation.IsNot]: 'NONE',
};
