import { Model } from "realmdb/Model";
import { Pilot } from "realmdb/Pilot";
import { eventKind } from "lib/modelEvent";
import { secondsToMSS } from "lib/formatters";

export const modelSummary = (model: Model) => {
  const count = model.statistics.totalEvents || 0;
  const kind = `${eventKind(model.type).name.toLowerCase()}${count !== 1 ? 's' : ''}`;
  const time = `${secondsToMSS(model.statistics.totalTime, {format: 'h:mm'})} total time`;
  return `${count} ${kind}\n${time}`;
};

export const modelPilotSummary = (model: Model, pilot: Pilot) => {
  // Get total time and event count for this pilot on the specified model.
  let count = 0;
  const totalTime = model.events.reduce((accumulator, event) => {
    if (event.pilot!._id.toString() === pilot!._id.toString()) {
      count++;
      return accumulator += event.duration;
    } else {
      return accumulator;
    }
  }, 0);
  const time = secondsToMSS(totalTime, {format: 'h:mm'});
  const events = `${count} ${eventKind(model.type).name.toLowerCase()}${count !== 1 ? 's' : ''}`;
  return `${time}, ${events}`;
};
