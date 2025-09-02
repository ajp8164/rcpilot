import { useQuery } from '@realm/react';
import { secondsToFormat } from 'lib/formatters';
import { Commander } from 'realmdb/Commander';
import { Event } from 'realmdb/Event';

export const useCommanderSummary = () => {
  const events = useQuery(Event);

  return (commander: Commander) => {
    const commanderEvents = events.filtered(
      `commander._id == $0`,
      commander._id,
    );
    const totalTime = commanderEvents.reduce((accumulator, event) => {
      return (accumulator += event.duration);
    }, 0);

    let time = secondsToFormat(totalTime, { format: "h'h' m'm'" });
    time = time.replace(/^0h /g, ''); // Remove zero values
    time = time.replace(' 0m', '');

    const eventCount = `${commanderEvents.length} event${commanderEvents.length !== 1 ? 's' : ''}`;
    return `Logged ${time} over ${eventCount}`;
  };
};
