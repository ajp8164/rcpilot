import { Model } from "realmdb/Model";
import { Pilot } from "realmdb/Pilot";
import { secondsToMSS } from "lib/formatters";

export const modelShortSummary = (model: Model) => {
  return `${model.statistics.totalEvents || 0} events\n${model.statistics.totalTime} total time`;
};

export const modelPilotSummary = (model: Model, pilot: Pilot) => {
  // Get total time and event count for this pilot on the specified model.
  let eventCount = 0;
  const totalTime = model.events.reduce((accumulator, event) => {
    if (event.pilot!._id.toString() === pilot!._id.toString()) {
      eventCount++;
      return accumulator += event.duration;
    } else {
      return accumulator;
    }
  }, 0);
  const time = secondsToMSS(totalTime, {format: 'h:mm'});
  const events = `${eventCount} event${eventCount !== 1 ? 's' : ''}`;
  return `${time}, ${events}`;
};
