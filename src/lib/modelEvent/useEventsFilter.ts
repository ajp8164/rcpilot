import {
  DateRelation,
  EnumRelation,
  NumberRelation,
  RQL,
  RQLCol,
  StringRelation
} from 'components/molecules/filters';
import { useObject, useQuery } from '@realm/react';

import { BSON } from 'realm';
import { Event } from 'realmdb/Event';
import { Filter } from 'realmdb/Filter';
import { MSSToSeconds } from 'lib/formatters';
import { getDate } from 'lib/filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useSelector } from 'react-redux';

export const useEventsFilter = (modelId: string) => {
  const filterId = useSelector(selectFilters).eventFilterId;
  const filter = useObject(Filter, new BSON.ObjectId(filterId))?.values;

  let result = useQuery(Event, events => { return events.filtered(`model._id == oid(${modelId})`) });
  
  if (!filter) return result;

  if (filter.date.relation !== DateRelation.Any) {
    result = result.filtered(`date ${RQL[filter.date.relation]} $0`, getDate(filter.date));
  }
  if (filter.duration.relation !== NumberRelation.Any) {
    result = result.filtered(`duration ${RQL[filter.duration.relation]} $0`, MSSToSeconds(filter.duration.value[0]));
  }
  if (filter.battery.relation !== EnumRelation.Any) {
    result = result.filtered(`${RQLCol[filter.battery.relation]} batteryCycles.battery.name == $0`, [...filter.battery.value]);
  }
  if (filter.location.relation !== EnumRelation.Any) {
    result = result.filtered(`location.name ${RQL[filter.location.relation]} $0`, [...filter.location.value]);
  }
  if (filter.pilot.relation !== EnumRelation.Any) {
    result = result.filtered(`pilot.name ${RQL[filter.pilot.relation]} $0`, [...filter.pilot.value]);
  }
  if (filter.outcome.relation !== EnumRelation.Any) {
    result = result.filtered(`outcome.name ${RQL[filter.outcome.relation]} $0`, [...filter.outcome.value]);
  }
  if (filter.notes.relation !== StringRelation.Any) {
    result = result.filtered(`notes TEXT $0`, `${RQL[filter.notes.relation]}${filter.notes.value[0]}`);
  }

  return result;
};