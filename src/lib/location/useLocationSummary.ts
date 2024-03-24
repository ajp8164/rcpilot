import { Event, Location } from 'realmdb';

import { DateTime } from 'luxon';
import { useRealm } from '@realm/react';

export const useLocationSummary = (location: Location) => {
  const realm = useRealm();
  const allEvents = realm.objects(Event).filtered('location == $0', location).sorted('date');
  const count = allEvents.length > 0 ? `${allEvents.length} events, ` : 'No events';
  const date = allEvents.length > 0 ? `last ${DateTime.fromISO(allEvents[0].date)}` : '';
  return `${count}${date}`;
};
