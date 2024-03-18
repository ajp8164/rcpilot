import { EnumRelation, NumberRelation } from 'components/molecules/filters';

import { BatteryFilterValues } from 'types/filter';

export const defaultFilter: BatteryFilterValues = {
  chemistry: { relation: EnumRelation.Any, value: [] },
  totalTime: { relation: NumberRelation.Any, value: [] },
  capacity: { relation: NumberRelation.Any, value: [] },
  cRating: { relation: NumberRelation.Any, value: [] },
  sCells: { relation: NumberRelation.Any, value: [] },
  pCells: { relation: NumberRelation.Any, value: [] },
};
