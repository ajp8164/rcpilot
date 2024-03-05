import { Model, ModelEventDurationData, ModelStatistics } from 'realmdb/Model';

import { EventOutcome } from 'types/event';
import { EventStyle } from 'realmdb/EventStyle';
import { useRealm } from '@realm/react';

export type ModelCostStatistics = {
  perEventCost: number;
  uncertainCost: boolean;
};

// Computes all model statistics in response to a new model event. The result of these
// calculations should replace the previous model statistics.
export const useModelStatistics = () => {
  const realm = useRealm();

  return (
    model: Model,
    theEventDuration: number,
    theEventStyle?: EventStyle,
    theEventOutcome?: EventOutcome,
  ) => {
    // Event duration data.
    const eventDurationData = [] as ModelEventDurationData[];

    // Recompute event durations for all styles.
    const allEventStyles = realm.objects<EventStyle>('EventStyle');
    if (allEventStyles.length) {
      allEventStyles.forEach(style => {
        eventDurationData.push(
          computeEventDurationData(model, theEventDuration, theEventStyle, style)
        );
      });
    }
    // Unspecified style.
    eventDurationData.push(
      computeEventDurationData(model, theEventDuration, theEventStyle)
    );

    // Crash summary.
    let crashCount = model!.statistics.crashCount;
    if (theEventOutcome === EventOutcome.Crashed) {
      crashCount++;
    }

    // Cost data.
    const costData = modelCostStatistics(model);

    return {
      ...model!.statistics,
      ...costData,
      crashCount,
      eventDurationData,
    } as ModelStatistics;
  };
};

export const modelCostStatistics = (model: Model) => {
  // Operating costs.
  // Can only compute per event cost here.
  let uncertainCost = model!.statistics.uncertainCost || false;
  if (!model!.purchasePrice) {
    uncertainCost = true;
  }

  // Per-event cost.
  let perEventCost = 0;
  if (model!.statistics.totalEvents > 0) {
    perEventCost =
      ((model!.purchasePrice || 0) + model!.statistics.totalMaintenanceCost) / model!.statistics.totalEvents;
  }
    
  return {
    perEventCost,
    uncertainCost,
  } as ModelCostStatistics;
};

// Computes event duration data for the event and the specified event style. This function
// should be called once for each even style defined in the database plus once with no specified
// style to account for 'unspecified' event style. Duration data entries are lazily created to
// ensure all statisitics match user defined event styles.
const computeEventDurationData = (
  model: Model,
  theEventDuration: number,
  theEventStyle?: EventStyle,
  style?: EventStyle,
) => {
  // Find existing duration data for the specified style.
  let previousDurationData = model?.statistics.eventDurationData.find(d =>
    d.eventStyleId === (style?._id.toString() || '')
  );

  if (!previousDurationData) {
    // Lazily create a new data entry.
    previousDurationData = {
      eventStyleId: style?._id.toString() || '',
      eventStyleCount: 0,
      eventStyleDuration: 0,
    } as ModelEventDurationData;
  }

  let durationData = {
    eventStyleId: previousDurationData.eventStyleId,
    eventStyleCount: previousDurationData.eventStyleCount,
    eventStyleDuration: previousDurationData.eventStyleDuration,
  };

  if ((style?._id.toString() || undefined) === (theEventStyle?._id.toString() || undefined)) {
    // Update data using this event.
    durationData = {
      ...previousDurationData,
      eventStyleCount: previousDurationData.eventStyleCount + 1,
      eventStyleDuration: previousDurationData.eventStyleDuration + theEventDuration,
    } as ModelEventDurationData;
  }

  return durationData as ModelEventDurationData;
};
