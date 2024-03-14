import {
  BooleanRelation,
  DateRelation,
  EnumRelation,
  RQL,
  StringRelation
} from 'components/molecules/filters';
import { useObject, useQuery } from '@realm/react';

import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { Model } from 'realmdb/Model';
import { getDate } from 'lib/filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useSelector } from 'react-redux';

export const useModelsFilter = () => {
  const filterId = useSelector(selectFilters(FilterType.ModelsFilter));
  const filter = useObject(Filter, new BSON.ObjectId(filterId))?.values;
  let result = useQuery(Model);
  
  if (!filter) return result;
  
  if (filter.category.relation !== EnumRelation.Any) {
    result = result.filtered(`category.name ${RQL[filter.category.relation]} $0`, [...filter.category.value]);
  }
  if (filter.damaged.relation !== BooleanRelation.Any) {
    result = result.filtered(`damaged ${RQL[filter.damaged.relation]}`);
  }
  if (filter.logsBatteries.relation !== BooleanRelation.Any) {
    result = result.filtered(`logsBatteries ${RQL[filter.logsBatteries.relation]}`);
  }
  if (filter.logsFuel.relation !== BooleanRelation.Any) {
    result = result.filtered(`logsFuel ${RQL[filter.logsFuel.relation]}`);
  }
  if (filter.modelType.relation !== EnumRelation.Any) {
    result = result.filtered(`type ${RQL[filter.modelType.relation]} $0`, [...filter.modelType.value]);
  }
  if (filter.lastEvent.relation !== DateRelation.Any) {
    result = result.filtered(`lastEvent ${RQL[filter.lastEvent.relation]} $0`, getDate(filter.lastEvent));
  }
  if (filter.vendor.relation !== StringRelation.Any) {
    result = result.filtered(`vendor TEXT $0`, `${RQL[filter.notes.relation]}${filter.vendor.value[0]}`);
  }
  if (filter.notes.relation !== StringRelation.Any) {
    result = result.filtered(`notes TEXT $0`, `${RQL[filter.notes.relation]}${filter.notes.value[0]}`);
  }

  return result;
};
