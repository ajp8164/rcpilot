import { secondsToFormat } from 'lib/formatters';
import { DateTime } from 'luxon';
import { Event } from 'realmdb/Event';

export const eventPower = (event: Event) => {
  let battery = '';
  if (event.model?.logsBatteries) {
    if (event.batteryCycles.length === 0) {
      battery = 'no batteries used during this event';
    } else if (event.batteryCycles.length === 1) {
      battery = `Battery: ${event.batteryCycles[0].battery.name}`;
    } else {
      battery = `${event.batteryCycles.length} batteries used during this event`;
    }
  }

  let fuel = '';
  if (event.model?.logsFuel) {
    if (event.fuelConsumed !== undefined) {
      fuel = `Fuel: ${event.fuelConsumed}oz`;
    }
  }
  const summary = `${fuel}${fuel && battery ? ', ' : ''}${battery}`;
  return summary.length ? summary : undefined;
};

export const eventSummary = (
  event: Event,
  opts?: { includeNumber?: boolean },
) => {
  const number = opts?.includeNumber ? `#${event.number}: ` : '';

  let duration = secondsToFormat(event.duration, { format: "m'm' s's'" });
  duration = duration.replace(/^0m/g, ''); // Remove zero values
  duration = duration.replace(' 0s', '');

  const time = DateTime.fromISO(event.createdOn).toLocaleString(
    DateTime.TIME_SIMPLE,
  );
  const location = `${event.location?.name || 'Unknown location'}`;
  return `${number}${duration} at ${time}, ${location}`;
};
