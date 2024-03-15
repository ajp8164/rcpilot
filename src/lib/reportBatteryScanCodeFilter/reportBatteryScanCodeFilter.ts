import {
  EnumRelation,
  NumberRelation,
} from 'components/molecules/filters';

import { ReportBatteryScanCodeFilterValues } from 'types/filter';

export const defaultFilter: ReportBatteryScanCodeFilterValues = {
  chemistry: { relation: EnumRelation.Any, value: [] },
  capacity: { relation: NumberRelation.Any, value: [] },
};
