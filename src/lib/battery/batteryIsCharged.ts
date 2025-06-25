import { Battery } from 'realmdb/Battery';

export const batteryIsCharged = (battery: Battery) => {
  return (
    battery.cycles[battery.cycles.length - 1]?.charge || !battery.cycles.length
  );
};
