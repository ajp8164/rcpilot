import { useRealm } from '@realm/react';
import { DateTime } from 'luxon';
import { Event, Location } from 'realmdb';

export const useLocationSummary = (location: Location) => {
  const realm = useRealm();
  const allEvents = realm
    .objects(Event)
    .filtered('location == $0', location)
    .sorted('date');
  const count =
    allEvents.length > 0
      ? `${allEvents.length} event${allEvents.length !== 1 ? 's' : ''}, `
      : 'No events';
  const date =
    allEvents.length > 0
      ? `last on ${DateTime.fromISO(allEvents[0].date).toFormat('M/d/yyyy')}`
      : '';
  return `${count}${date}`;
};
