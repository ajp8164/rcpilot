import { useObject, useQuery } from '@realm/react';
import { rql } from 'components/molecules/filters';
import { useSelector } from 'react-redux';
import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { FilterType } from 'types/filter';

export const useBatteriesFilter = () => {
  const filterId = useSelector(selectFilters(FilterType.BatteriesFilter));
  const values = useObject(Filter, new BSON.ObjectId(filterId))?.values;
  const batteries = useQuery<Battery>('Battery');

  const query = rql()
    .and('chemistry', values?.chemistry)
    .and('totalTime', values?.totalTime)
    .and('capacity', values?.capacity)
    .and('cRating', values?.cRating)
    .and('sCells', values?.sCells)
    .and('pCells', values?.pCells)
    .string();

  return query ? batteries.filtered(query) : batteries;
};
