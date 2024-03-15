import {
  DateRelation,
  EnumRelation,
  NumberRelation,
  StringRelation,
} from 'components/molecules/filters';

import { ReportModelMaintenanceFilterValues } from 'types/filter';

export const defaultFilter: ReportModelMaintenanceFilterValues = {
  model: { relation: EnumRelation.Any, value: [] },
  modelType: { relation: EnumRelation.Any, value: [] },
  category: { relation: EnumRelation.Any, value: [] },
  date: { relation: DateRelation.Any, value: [] },
  costs: { relation: NumberRelation.Any, value: [] },
  notes: { relation: StringRelation.Any, value: [] },
};
