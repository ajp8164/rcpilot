import { useQuery } from '@realm/react';
import { secondsToFormat } from 'lib/formatters';
import { Event } from 'realmdb/Event';
import { Pilot } from 'realmdb/Pilot';

export const usePilotSummary = () => {
  const events = useQuery(Event);

  return (pilot: Pilot) => {
    const pilotEvents = events.filtered(`pilot._id == $0`, pilot._id);
    const totalTime = pilotEvents.reduce((accumulator, event) => {
      return (accumulator += event.duration);
    }, 0);

    let time = secondsToFormat(totalTime, { format: "h'h' m'm'" });
    time = time.replace(/^0h /g, ''); // Remove zero values
    time = time.replace(' 0m', '');

    const eventCount = `${pilotEvents.length} event${pilotEvents.length !== 1 ? 's' : ''}`;
    return `Logged ${time} over ${eventCount}`;
  };
};
