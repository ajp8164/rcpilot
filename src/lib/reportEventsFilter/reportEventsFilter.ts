import {
  DateRelation,
  EnumRelation,
  NumberRelation,
} from 'components/molecules/filters';

import { ReportEventFilterValues } from 'types/filter';

export const defaultFilter: ReportEventFilterValues = {
  model: { relation: EnumRelation.Any, value: [] },
  modelType: { relation: EnumRelation.Any, value: [] },
  category: { relation: EnumRelation.Any, value: [] },
  date: { relation: DateRelation.Any, value: [] },
  duration: { relation: NumberRelation.Any, value: [] },
  pilot: { relation: EnumRelation.Any, value: [] },
  style: { relation: EnumRelation.Any, value: [] },
  outcome: { relation: EnumRelation.Any, value: [] },
};
