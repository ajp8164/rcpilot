import { Model, ModelEventDurationData, ModelStatistics } from 'realmdb/Model';

import { EventOutcome } from 'types/event';
import { EventStyle } from 'realmdb/EventStyle';
import { useRealm } from '@realm/react';

export type ModelStatisticsMode = 'add' | 'update';
export type ModelCostStatistics = {
  perEventCost: number;
  totalMaintenanceCost: number;
  uncertainCost: boolean;
};

// Computes all model statistics in response to a new model event. The result of these
// calculations should replace the previous model statistics.
export const useModelStatistics = () => {
  const realm = useRealm();

  return (
    mode: ModelStatisticsMode,
    model: Model,
    newEventDuration: number,
    newEventOutcome?: EventOutcome,
    oldEventStyle?: EventStyle,
    newEventStyle?: EventStyle,
  ) => {
    // Event duration data.
    const eventDurationData = [] as ModelEventDurationData[];

    // Recompute event durations for all styles.
    const allEventStyles = realm.objects<EventStyle>('EventStyle');
    if (allEventStyles.length) {
      allEventStyles.forEach(style => {
        eventDurationData.push(
          computeEventDurationData(
            mode,
            model,
            newEventDuration,
            oldEventStyle,
            newEventStyle,
            style,
          )
        );
      });
    }
    // Unspecified style.
    eventDurationData.push(
      computeEventDurationData(mode, model, newEventDuration, oldEventStyle, newEventStyle)
    );

    // Crash summary.
    let crashCount = model!.statistics.crashCount;
    if (newEventOutcome === EventOutcome.Crashed) {
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

export const modelCostStatistics = (model: Model, maintenance?: {oldValue?: number; newValue?: number}) => {
  // Operating costs.
  // Can only compute per event cost here.
  let uncertainCost = model.statistics.uncertainCost || false;
  if (!model.purchasePrice) {
    uncertainCost = true;
  }

  // Per-event cost.
  let perEventCost = 0;
  if (model.statistics.totalEvents > 0) {
    perEventCost =
      ((model.purchasePrice || 0) + model.statistics.totalMaintenanceCost) / model.statistics.totalEvents;
  } else {
    perEventCost = (model.purchasePrice || 0) + model.statistics.totalMaintenanceCost;
  }
  
  // Maintenance cost.
  const totalMaintenanceCost =
    model.statistics.totalMaintenanceCost - (maintenance?.oldValue || 0) + (maintenance?.newValue || 0);

  return {
    perEventCost,
    totalMaintenanceCost,
    uncertainCost,
  } as ModelCostStatistics;
};

export const updateModelMaintenanceCost = (model: Model, oldValue: number, newValue: number) => {
  model.statistics.totalMaintenanceCost = model.statistics.totalMaintenanceCost - oldValue + newValue;
};

// Computes event duration data for the event and the specified event style. This function
// should be called once for each even style defined in the database plus once with no specified
// style to account for 'unspecified' event style. Duration data entries are lazily created to
// ensure all statisitics match user defined event styles.
const computeEventDurationData = (
  mode: ModelStatisticsMode,
  model: Model,
  newEventDuration: number,
  oldEventStyle?: EventStyle,
  newEventStyle?: EventStyle,
  style?: EventStyle,
) => {
  // Find existing duration data for the specified style.
  let previousDurationData = model.statistics.eventDurationData.find(d =>
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

  // Update data using this event.
  // Add to the new event style, remove from the old event style.
  // The mode tells us if we should ever reduce stats in an event style.
  if (style?._id.toString() === newEventStyle?._id.toString()) {
    durationData = {
      ...previousDurationData,
      eventStyleCount: previousDurationData.eventStyleCount + 1,
      eventStyleDuration: previousDurationData.eventStyleDuration + newEventDuration,
    } as ModelEventDurationData;
  } else if (mode === 'update' && style?._id.toString() === oldEventStyle?._id.toString()) {
    durationData = {
      ...previousDurationData,
      eventStyleCount: previousDurationData.eventStyleCount - 1,
      eventStyleDuration: previousDurationData.eventStyleDuration - newEventDuration,
    } as ModelEventDurationData;
  }

  return durationData as ModelEventDurationData;
};
