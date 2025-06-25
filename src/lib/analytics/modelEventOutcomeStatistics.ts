import { EventOutcome } from 'types/event';
import { Model } from 'realmdb/Model';

export const modelEventOutcomeStatistics = (
  model: Model,
  newEventOutcome?: EventOutcome,
) => {
  // Crash summary.
  let crashCount = model.statistics.crashCount || 0;
  if (newEventOutcome === EventOutcome.Crashed) {
    crashCount++;
  }

  return { crashCount };
};
