import { secondsToFormat } from 'lib/formatters';
import { eventKind } from 'lib/modelEvent';
import { Model } from 'realmdb/Model';

export const modelSummary = (model: Model) => {
  const count = model.statistics.totalEvents || 0;
  const kind = `${eventKind(model.type).name.toLowerCase()}${count !== 1 ? 's' : ''}`;

  let time = secondsToFormat(model.statistics.totalTime, {
    format: "h'h' m'm'",
  });
  time = time.replace(/^0h /g, ''); // Remove zero values
  time = time.replace(' 0m', '');
  if (time.length) {
    time = `${time} total time`;
  }

  return `${count} ${kind}\n${time}`;
};
