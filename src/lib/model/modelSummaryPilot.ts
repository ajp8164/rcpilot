import { secondsToFormat } from 'lib/formatters';
import { eventKind } from 'lib/modelEvent';
import { Model } from 'realmdb/Model';
import { Pilot } from 'realmdb/Pilot';

export const modelSummaryPilot = (model: Model, pilot: Pilot) => {
  // Get total time and event count for this pilot on the specified model.
  let count = 0;
  const totalTime = model.events.reduce((accumulator, event) => {
    if (event.pilot._id.toString() === pilot._id.toString()) {
      count++;
      return (accumulator += event.duration);
    } else {
      return accumulator;
    }
  }, 0);

  let time = secondsToFormat(totalTime, { format: "h'h' m'm'" });
  time = time.replace(/^0h /g, ''); // Remove zero values
  time = time.replace(' 0m', '');
  const events = `${count} ${eventKind(model.type).name.toLowerCase()}${count !== 1 ? 's' : ''}`;

  return `${time}, ${events}`;
};
