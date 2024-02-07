import { BatteryTint } from 'types/battery';
import { EnumPickerIconProps } from 'components/EnumPickerScreen';

const icon: EnumPickerIconProps = {
  name: 'battery-full',
  size: 28,
  style: { width: 35, transform: [{rotate: '-90deg'}] },
};

export const batteryTintIcons: {[key in BatteryTint]: EnumPickerIconProps} = {
  [BatteryTint.Red]: {...icon, color: 'red'},
  [BatteryTint.Orange]: {...icon, color: 'orange'},
  [BatteryTint.Green]: {...icon, color: 'green'},
  [BatteryTint.Cyan]: {...icon, color: 'cyan'},
  [BatteryTint.Blue]: {...icon, color: 'blue'},
  [BatteryTint.Violet]: {...icon, color: 'violet'},
  [BatteryTint.None]: {...icon},
}