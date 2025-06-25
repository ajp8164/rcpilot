import { Battery } from 'realmdb/Battery';
import { Model } from 'realmdb/Model';

export const batteryPerformanceWithModel = (
  _model: Model,
  _batteries: Battery[],
) => {
  // For each battery
  //   Find all events where the battery was used with this model
  //   Group the events by event style
  //   For each event style
  //     For each event
  //       Compute energy consumption time to 80%
  //     Average all the energy consumption times (add up times divide by event count)
  //
  return [
    {
      style: 'Training',
      count: 23,
      seconds: 230,
    },
  ];
};
