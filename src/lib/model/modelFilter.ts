import {
  BooleanRelation,
  DateRelation,
  EnumRelation,
  NumberRelation,
  StringRelation
} from 'components/molecules/filters';

import { ModelFilterValues } from 'types/filter';

export const defaultFilter: ModelFilterValues = {
  modelType: { relation: EnumRelation.Any, value: [] },
  category: { relation: EnumRelation.Any, value: [] },
  lastEvent: { relation: DateRelation.Any, value: [] },
  totalTime: { relation: NumberRelation.Any, value: [] },
  logsBatteries: { relation: BooleanRelation.Any, value: [] },
  logsFuel: { relation: BooleanRelation.Any, value: [] },
  damaged: { relation: BooleanRelation.Any, value: [] },
  vendor: { relation: StringRelation.Any, value: [] },
  notes: { relation: StringRelation.Any, value: [] },
};
