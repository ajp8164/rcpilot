import { useRealm } from '@realm/react';
import { DateTime } from 'luxon';
import { Event, Location } from 'realmdb';

export const useLocationSummary = (location?: Location) => {
  const realm = useRealm();

  let count = 0;
  let countStr = '';
  let date = '';
  let dateStr = '';

  if (location?.isValid()) {
    const allEvents = realm
      .objects(Event)
      .filtered('location._id == $0', location._id)
      .sorted('date');

    count = allEvents.length;
    countStr =
      allEvents.length > 0
        ? `${count} event${count !== 1 ? 's' : ''}, `
        : 'No events';

    date = allEvents.length
      ? DateTime.fromISO(allEvents[0].date).toFormat('M/d/yyyy')
      : 'None';
    dateStr = allEvents.length > 0 ? `last on ${date}` : '';
  }

  return {
    count,
    date,
    text: `${countStr}${dateStr}`,
  };
};
