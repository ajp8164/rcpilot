import { Model } from "realmdb/Model";
import { eventKind } from "lib/modelEvent";
import { secondsToMSS } from "lib/formatters";

export const modelSummary = (model: Model) => {
  const count = model.statistics.totalEvents || 0;
  const kind = `${eventKind(model.type).name.toLowerCase()}${count !== 1 ? 's' : ''}`;
  const time = `${secondsToMSS(model.statistics.totalTime, {format: 'h:mm'})} total time`;
  return `${count} ${kind}\n${time}`;
};
