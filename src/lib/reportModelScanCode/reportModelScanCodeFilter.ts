import {
  DateRelation,
  EnumRelation,
} from 'components/molecules/filters';

import { ReportModelScanCodeFilterValues } from 'types/filter';

export const defaultFilter: ReportModelScanCodeFilterValues = {
  modelType: { relation: EnumRelation.Any, value: [] },
  category: { relation: EnumRelation.Any, value: [] },
  lastEvent: { relation: DateRelation.Any, value: [] },
};
