import { Model, ModelEventStyleData } from 'realmdb/Model';

import { EventStyle } from 'realmdb/EventStyle';
import { useRealm } from '@realm/react';

export type ModelStatisticsMode = 'add' | 'init' | 'update';

// Computes all model statistics in response to a new model event. The result of these
// calculations should replace the previous model statistics.
export const useModelEventStyleStatistics = () => {
  const realm = useRealm();

  return (
    mode: ModelStatisticsMode,
    model: Model,
    newEventDuration: number,
    oldEventStyle?: EventStyle,
    newEventStyle?: EventStyle,
  ) => {
    // Event duration data.
    const eventStyleData = [] as ModelEventStyleData[];

    // Recompute event durations for all styles.
    const allEventStyles = realm.objects<EventStyle>('EventStyle');
    if (allEventStyles.length) {
      allEventStyles.forEach(style => {
        eventStyleData.push(
          computeEventDurationData(
            mode,
            model,
            newEventDuration,
            oldEventStyle,
            newEventStyle,
            style,
          ),
        );
      });
    }
    // Unspecified style.
    eventStyleData.push(
      computeEventDurationData(mode, model, newEventDuration, oldEventStyle, newEventStyle),
    );

    return eventStyleData;
  };
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
  let previousDurationData = model.statistics.eventStyleData?.find(
    d => d.eventStyleId === (style?._id.toString() || ''),
  );

  if (!previousDurationData) {
    // Lazily create a new data entry.
    previousDurationData = {
      eventStyleId: style?._id.toString() || '',
      eventStyleCount: 0,
      eventStyleDuration: 0,
    } as ModelEventStyleData;
  }

  let durationData = {
    eventStyleId: previousDurationData.eventStyleId,
    eventStyleCount: previousDurationData.eventStyleCount,
    eventStyleDuration: previousDurationData.eventStyleDuration,
  };

  // Update data using this event.
  // Add to the new event style, remove from the old event style.
  // The mode tells us if we should ever reduce stats in an event style.
  if (mode === 'init' && style?._id.toString() === oldEventStyle?._id.toString()) {
    durationData = {
      ...previousDurationData,
      eventStyleCount: 0,
      eventStyleDuration: 0,
    } as ModelEventStyleData;
  } else if (mode === 'update' && style?._id.toString() === oldEventStyle?._id.toString()) {
    durationData = {
      ...previousDurationData,
      eventStyleCount: previousDurationData.eventStyleCount - 1,
      eventStyleDuration: previousDurationData.eventStyleDuration - newEventDuration,
    } as ModelEventStyleData;
  } else if (style?._id.toString() === newEventStyle?._id.toString()) {
    durationData = {
      ...previousDurationData,
      eventStyleCount: previousDurationData.eventStyleCount + 1,
      eventStyleDuration: previousDurationData.eventStyleDuration + newEventDuration,
    } as ModelEventStyleData;
  }

  return durationData as ModelEventStyleData;
};
