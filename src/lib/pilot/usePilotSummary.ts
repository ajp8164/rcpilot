import { Event } from 'realmdb/Event';
import { Pilot } from 'realmdb/Pilot';
import { secondsToMSS } from 'lib/formatters';
import { useQuery } from '@realm/react';

export const usePilotSummary = () => {
  const events = useQuery(Event);

  return (pilot: Pilot) => {
    const pilotEvents = events.filtered(`pilot._id == oid(${pilot._id})`);
    const totalTime = pilotEvents.reduce((accumulator, event) => {
      return (accumulator += event.duration);
    }, 0);

    const time = secondsToMSS(totalTime, { format: 'm:ss' });
    const eventCount = `${pilotEvents.length} event${pilotEvents.length !== 1 ? 's' : ''}`;
    return `Logged ${time} over ${eventCount}`;
  };
};
