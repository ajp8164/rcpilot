import { useSelector } from 'react-redux';

import { useObject, useQuery } from '@realm/react';
import { EnumRelation, rql } from 'components/molecules/filters';
import { BSON } from 'realm';
import { Event } from 'realmdb/Event';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { FilterType } from 'types/filter';

export const useEventsFilter = (params: {
  filterType: FilterType;
  batteryId?: string;
  eventStyleId?: string;
  locationId?: string;
  modelId?: string;
  pilotId?: string;
}) => {
  const { filterType, batteryId, eventStyleId, locationId, modelId, pilotId } =
    params;

  const filterId = useSelector(selectFilters(filterType));
  const values = useObject(Filter, new BSON.ObjectId(filterId))?.values;
  const events = useQuery<Event>('Event');

  const query = rql()
    .and(
      'battery._id',
      batteryId ? { value: [batteryId], relation: EnumRelation.Is } : undefined,
    )
    .and(
      'model._id',
      modelId ? { value: [modelId], relation: EnumRelation.Is } : undefined,
    )
    .and(
      'eventStyle._id',
      eventStyleId
        ? { value: [eventStyleId], relation: EnumRelation.Is }
        : undefined,
    )
    .and(
      'location._id',
      locationId
        ? { value: [locationId], relation: EnumRelation.Is }
        : undefined,
    )
    .and(
      'pilot._id',
      pilotId ? { value: [pilotId], relation: EnumRelation.Is } : undefined,
    )
    .and('date', values?.date)
    .and('duration', values?.duration)
    .and('location.name', values?.location)
    .and('pilot.name', values?.pilot)
    .and('outcome', values?.outcome)
    .and('notes', values?.notes)
    .string();

  return query ? events.filtered(query) : events;
};
