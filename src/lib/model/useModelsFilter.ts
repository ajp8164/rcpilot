import {
  BooleanRelation,
  DateRelation,
  EnumRelation,
  RQL,
  StringRelation
} from 'components/molecules/filters';
import { useObject, useQuery } from '@realm/react';

import { BSON } from 'realm';
import { DateTime } from 'luxon';
import { Filter } from 'realmdb/Filter';
import { Model } from 'realmdb/Model';
import { TimeSpan } from 'types/common';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useSelector } from 'react-redux';

export const useModelsFilter = () => {
  const filterId = useSelector(selectFilters).modelFilterId;
  const filter = useObject(Filter, new BSON.ObjectId(filterId))?.values;
  let result = useQuery(Model);
  
  if (!filter) return result;

  let lastEventDate = DateTime.fromISO(filter.lastEvent.value[0]).toUnixInteger().toString();
  if (filter.lastEvent.relation === DateRelation.Past) {
    const num = parseInt(filter.lastEvent.value[0]);
    const timeframe = filter.lastEvent.value[1]; 
    let days = num;
    switch (timeframe) {
      case TimeSpan.Weeks: days = num * 7; break;
      case TimeSpan.Months: days = num * 30; break;
      case TimeSpan.Years: days = num * 365; break;
    }
    lastEventDate = DateTime.now().minus({days}).toUnixInteger().toString();
   } 

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
    result = result.filtered(`lastEvent ${RQL[filter.lastEvent.relation]} $0`, lastEventDate);
  }
  if (filter.vendor.relation !== StringRelation.Any) {
    result = result.filtered(`vendor TEXT $0`, `${RQL[filter.notes.relation]}${filter.vendor.value[0]}`);
  }
  if (filter.notes.relation !== StringRelation.Any) {
    result = result.filtered(`notes TEXT $0`, `${RQL[filter.notes.relation]}${filter.notes.value[0]}`);
  }

  return result;
};
