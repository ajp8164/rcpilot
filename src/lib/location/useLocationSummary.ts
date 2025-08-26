import { useRealm } from '@realm/react';
import { DateTime } from 'luxon';
import { Event, Location } from 'realmdb';

export const useLocationSummary = (location: Location) => {
  const realm = useRealm();
  const allEvents = realm
    .objects(Event)
    .filtered('location == $0', location)
    .sorted('date');

  const count = allEvents.length;
  const countStr =
    allEvents.length > 0
      ? `${count} event${count !== 1 ? 's' : ''}, `
      : 'No events';

  const date = allEvents.length
    ? DateTime.fromISO(allEvents[0].date).toFormat('M/d/yyyy')
    : 'None';
  const dateStr = allEvents.length > 0 ? `last on ${date}` : '';

  return {
    count,
    date,
    text: `${countStr}${dateStr}`,
  };
};
