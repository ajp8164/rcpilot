import { Model } from 'realmdb/Model';
import { EventOutcome } from 'types/event';

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
