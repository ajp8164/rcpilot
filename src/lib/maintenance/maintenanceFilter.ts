import {
  DateRelation,
  NumberRelation,
  StringRelation
} from 'components/molecules/filters';

import { ModelMaintenanceFilterValues } from 'types/filter';

export const defaultFilter: ModelMaintenanceFilterValues = {
  date: { relation: DateRelation.Any, value: [] },
  costs: { relation: NumberRelation.Any, value: [] },
  notes: { relation: StringRelation.Any, value: [] },
};
