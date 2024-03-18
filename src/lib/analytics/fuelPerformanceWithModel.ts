import { Model } from 'realmdb/Model';

export const fuelCapacityPerformanceWithModel = (_model: Model) => {
  //   Find all events where fuel was used with this model
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
