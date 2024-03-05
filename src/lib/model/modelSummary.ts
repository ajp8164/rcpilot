import { Model } from "realmdb/Model";

export const modelShortSummary = (model: Model) => {
  return `${model.statistics.totalEvents || 0} events\n${model.statistics.totalTime} total time`;
};
