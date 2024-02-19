import { Model } from "realmdb/Model";

export const modelShortSummary = (model: Model) => {
  return `${model.totalEvents || 0} events\n${model.totalTime} total time`;
};
