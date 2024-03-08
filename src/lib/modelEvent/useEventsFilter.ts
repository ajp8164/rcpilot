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
import { DateTime } from 'luxon';
import { Event } from 'realmdb/Event';
import { Filter } from 'realmdb/Filter';
import { MSSToSeconds } from 'lib/formatters';
import { TimeSpan } from 'types/common';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useSelector } from 'react-redux';

export const useEventsFilter = (modelId: string) => {
  const filterId = useSelector(selectFilters).eventFilterId;
  const filter = useObject(Filter, new BSON.ObjectId(filterId))?.values;

  let result = useQuery(Event, events => { return events.filtered(`model._id == oid(${modelId})`) });
  
  if (!filter) return result;

  let date = DateTime.fromISO(filter.date.value[0]).toUnixInteger().toString();
  if (filter.date.relation === DateRelation.Past) {
    const num = parseInt(filter.date.value[0]);
    const timeframe = filter.date.value[1]; 
    let days = num;
    switch (timeframe) {
      case TimeSpan.Weeks: days = num * 7; break;
      case TimeSpan.Months: days = num * 30; break;
      case TimeSpan.Years: days = num * 365; break;
    }
    date = DateTime.now().minus({days}).toUnixInteger().toString();
   } 

  if (filter.date.relation !== DateRelation.Any) {
    result = result.filtered(`date ${RQL[filter.date.relation]} $0`, date);
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
