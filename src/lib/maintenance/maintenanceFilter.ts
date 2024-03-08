import {
  DateRelation,
  NumberRelation,
  StringRelation
} from 'components/molecules/filters';

import { MaintenanceFilterValues } from 'types/filter';

export const defaultFilter: MaintenanceFilterValues = {
  date: { relation: DateRelation.Any, value: [] },
  costs: { relation: NumberRelation.Any, value: [] },
  notes: { relation: StringRelation.Any, value: [] },
};
