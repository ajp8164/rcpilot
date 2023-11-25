import { BatteryTint } from 'types/battery';
import { IconProps } from 'types/common';

const icon: IconProps = {
  name: 'battery-full',
  size: 28,
  style: { width: 35 },
};

export const batteryTintIcons: {[key in BatteryTint]: IconProps} = {
  [BatteryTint.Red]: {...icon, color: 'red'},
  [BatteryTint.Orange]: {...icon, color: 'orange'},
  [BatteryTint.Green]: {...icon, color: 'green'},
  [BatteryTint.Cyan]: {...icon, color: 'cyan'},
  [BatteryTint.Blue]: {...icon, color: 'blue'},
  [BatteryTint.Violet]: {...icon, color: 'violet'},
  [BatteryTint.None]: {...icon},
}