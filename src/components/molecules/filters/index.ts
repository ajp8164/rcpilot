export * from './ListItemFilterBoolean';
export * from './ListItemFilterDate';
export * from './ListItemFilterEnum';
export * from './ListItemFilterNumber';
export * from './ListItemFilterString';

export type FilterState =
  BooleanFilterState  |
  DateFilterState |
  EnumFilterState |
  NumberFilterState |
  StringFilterState;

export type BooleanFilterState = {
  relation: BooleanRelation;
  value?: string;
};
export type DateFilterState = {
  relation: DateRelation;
  value?: string;
};
export type EnumFilterState = {
  relation: EnumRelation;
  value?: string | string[];
};
export type NumberFilterState = {
  relation: NumberRelation;
  value?: string;
};
export type StringFilterState = {
  relation: StringRelation;
  value?: string;
};

export enum BooleanRelation {
  Any = 'Any',
  Yes = 'Yes',
  No = 'No',
};

export enum DateRelation {
  Any = 'Any',
  Before = 'Before',
  After = 'After',
  Past = 'Past',
};

export enum EnumRelation {
  Any = 'Any',
  Is = 'Is',
  IsNot = 'Is Not',
};

export enum NumberRelation {
  Any = 'Any',
  LT = '<',
  GT = '>',
  EQ = '=',
  NE = '!=',
};

export enum StringRelation {
  Any = 'Any',
  Contains = 'Contains',
  Missing = 'Missing',
};
