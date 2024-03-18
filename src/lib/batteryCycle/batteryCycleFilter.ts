import { DateRelation, NumberRelation, StringRelation } from 'components/molecules/filters';

import { BatteryCycleFilterValues } from 'types/filter';

export const defaultFilter: BatteryCycleFilterValues = {
  dischargeDate: { relation: DateRelation.Any, value: [] },
  dischargeDuration: { relation: NumberRelation.Any, value: [] },
  chargeDate: { relation: DateRelation.Any, value: [] },
  chargeAmount: { relation: NumberRelation.Any, value: [] },
  notes: { relation: StringRelation.Any, value: [] },
};
