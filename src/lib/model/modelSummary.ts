import { Model } from "realmdb/Model";

export const modelShortSummary = (model: Model) => {
  return `${model.stats.totalEvents || 0} events\n${model.stats.totalTime} total time`;
};
