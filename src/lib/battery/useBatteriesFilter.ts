import {
  EnumRelation,
  NumberRelation,
  RQL,
} from 'components/molecules/filters';
import { useObject, useQuery } from '@realm/react';

import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useSelector } from 'react-redux';

export const useBatteriesFilter = () => {
  const filterId = useSelector(selectFilters(FilterType.BatteriesFilter));
  const filter = useObject(Filter, new BSON.ObjectId(filterId))?.values;
  let result = useQuery(Battery);
  
  if (!filter) return result;

  if (filter.chemistry.relation !== EnumRelation.Any) {
    result = result.filtered(`chemistry ${RQL[filter.chemistry.relation]} $0`, [...filter.chemistry.value]);
  }
  if (filter.totalTime.relation !== NumberRelation.Any) {
    result = result.filtered(`totalTime ${RQL[filter.totalTime.relation]} $0`, parseFloat(filter.totalTime.value[0]));
  }
  if (filter.capacity.relation !== NumberRelation.Any) {
    result = result.filtered(`capacity ${RQL[filter.capacity.relation]} $0`, parseInt(filter.capacity.value[0]));
  }
  if (filter.cRating.relation !== NumberRelation.Any) {
    result = result.filtered(`cRating ${RQL[filter.cRating.relation]} $0`, parseInt(filter.cRating.value[0]));
  }
  if (filter.sCells.relation !== NumberRelation.Any) {
    result = result.filtered(`sCells ${RQL[filter.sCells.relation]} $0`, parseInt(filter.sCells.value[0]));
  }
  if (filter.pCells.relation !== NumberRelation.Any) {
    result = result.filtered(`pCells ${RQL[filter.pCells.relation]} $0`, parseInt(filter.pCells.value[0]));
  }

  return result;
};
