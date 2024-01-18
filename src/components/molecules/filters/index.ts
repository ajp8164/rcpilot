import { BooleanRelation } from './ListItemFilterBoolean';
import { DateRelation } from './ListItemFilterDate';
import { EnumRelation } from './ListItemFilterEnum';
import { NumberRelation } from './ListItemFilterNumber';
import { StringRelation } from './ListItemFilterString';

export * from './ListItemFilterBoolean';
export * from './ListItemFilterDate';
export * from './ListItemFilterEnum';
export * from './ListItemFilterNumber';
export * from './ListItemFilterString';

export type FilterState = {
  relation: BooleanRelation | DateRelation | EnumRelation | NumberRelation | StringRelation;
  value: string;
};
