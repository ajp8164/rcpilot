import { secondsToFormat } from 'lib/formatters';
import { eventKind } from 'lib/modelEvent';
import { Commander } from 'realmdb/Commander';
import { Model } from 'realmdb/Model';

export const modelSummaryCommander = (model: Model, commander: Commander) => {
  // Get total time and event count for this commander on the specified model.
  let count = 0;
  const totalTime = model.events.reduce((accumulator, event) => {
    if (event.commander._id.toString() === commander._id.toString()) {
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
