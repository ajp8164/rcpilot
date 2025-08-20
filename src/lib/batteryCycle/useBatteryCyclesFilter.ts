import { useSelector } from 'react-redux';

import { useObject, useQuery } from '@realm/react';
import { rql } from 'components/molecules/filters';
import { BSON } from 'realm';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { FilterType } from 'types/filter';

export const useBatteryCyclesFilter = (params: { batteryId: string }) => {
  const { batteryId } = params;

  const filterId = useSelector(selectFilters(FilterType.BatteryCyclesFilter));
  const values = useObject(Filter, new BSON.ObjectId(filterId))?.values;
  const batteryCycles = useQuery<BatteryCycle>('BatteryCycle', cycles => {
    return cycles.filtered(`battery._id == oid(${batteryId})`);
  });

  const query = rql()
    .and('discharge.date', values?.dischargeDate)
    .and('discharge.duration', values?.dischargeDuration)
    .and('charge.date', values?.chargeDate)
    .and('charge.amount', values?.chargeAmount)
    .and('notes', values?.notes)
    .string();

  return query ? batteryCycles.filtered(query) : batteryCycles;
};
