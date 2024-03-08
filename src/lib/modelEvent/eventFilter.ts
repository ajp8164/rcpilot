import {
  DateRelation,
  EnumRelation,
  NumberRelation,
  StringRelation
} from 'components/molecules/filters';

import { EventFilterValues } from 'types/filter';

export const defaultFilter: EventFilterValues = {
  date: { relation: DateRelation.Any, value: [] },
  duration: { relation: NumberRelation.Any, value: [] },
  style: { relation: EnumRelation.Any, value: [] },
  battery: { relation: EnumRelation.Any, value: [] },
  location: { relation: EnumRelation.Any, value: [] },
  pilot: { relation: EnumRelation.Any, value: [] },
  outcome: { relation: EnumRelation.Any, value: [] },
  notes: { relation: StringRelation.Any, value: [] },
};
