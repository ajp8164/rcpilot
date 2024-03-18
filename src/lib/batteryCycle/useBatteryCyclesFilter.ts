import { DateRelation, NumberRelation, RQL, StringRelation } from 'components/molecules/filters';
import { useObject, useQuery } from '@realm/react';

import { BSON } from 'realm';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { MSSToSeconds } from 'lib/formatters';
import { getDate } from 'lib/filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useSelector } from 'react-redux';

export const useBatteryCyclesFilter = (params: { batteryId: string }) => {
  const { batteryId } = params;

  const filterId = useSelector(selectFilters(FilterType.BatteryCyclesFilter));
  const filter = useObject(Filter, new BSON.ObjectId(filterId))?.values;
  let result = useQuery(BatteryCycle, cycles => {
    return cycles.filtered(`battery._id == oid(${batteryId})`);
  });

  if (!filter) return result;

  if (filter.dischargeDate.relation !== DateRelation.Any) {
    result = result.filtered(
      `discharge.date ${RQL[filter.dischargeDate.relation]} $0`,
      getDate(filter.dischargeDate),
    );
  }
  if (filter.dischargeDuration.relation !== NumberRelation.Any) {
    result = result.filtered(
      `discharge.duration ${RQL[filter.dischargeDuration.relation]} $0`,
      MSSToSeconds(filter.dischargeDuration.value[0]),
    );
  }
  if (filter.chargeDate.relation !== DateRelation.Any) {
    result = result.filtered(
      `charge.date ${RQL[filter.chargeDate.relation]} $0`,
      getDate(filter.chargeDate),
    );
  }
  if (filter.chargeAmount.relation !== NumberRelation.Any) {
    result = result.filtered(
      `charge.amount ${RQL[filter.chargeAmount.relation]} $0`,
      MSSToSeconds(filter.chargeAmount.value[0]),
    );
  }
  if (filter.notes.relation !== StringRelation.Any) {
    result = result.filtered(
      `notes TEXT $0`,
      `${RQL[filter.notes.relation]}${filter.notes.value[0]}`,
    );
  }

  return result;
};
