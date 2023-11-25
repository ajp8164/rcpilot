import { BatteryTint, BatteryUIAttribute } from 'types/battery';

export const batteryUIAttributes: {[key in BatteryTint]: BatteryUIAttribute} = {
  [BatteryTint.Red]: {icon:  ''},
  [BatteryTint.Orange]: {icon:  ''},
  [BatteryTint.Green]: {icon:  ''},
  [BatteryTint.Cyan]: {icon:  ''},
  [BatteryTint.Blue]: {icon:  ''},
  [BatteryTint.Violet]: {icon:  ''},
  [BatteryTint.None]: {icon:  ''},
}