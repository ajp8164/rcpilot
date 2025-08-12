import { EnumPickerIconProps } from 'components/EnumPickerScreen';
import { BatteryFull } from 'lucide-react-native';
import { BatteryTint } from 'types/battery';

type BatteryTintIconProps = {
  color?: string;
};

export const batteryTintIconProps: {
  [key in BatteryTint]: BatteryTintIconProps;
} = {
  [BatteryTint.Red]: { color: 'red' },
  [BatteryTint.Orange]: { color: 'orange' },
  [BatteryTint.Green]: { color: 'green' },
  [BatteryTint.Cyan]: { color: 'cyan' },
  [BatteryTint.Blue]: { color: 'blue' },
  [BatteryTint.Violet]: { color: 'violet' },
  [BatteryTint.None]: {},
};

export const batteryTintIcons: { [key in BatteryTint]: EnumPickerIconProps } = {
  [BatteryTint.Red]: {
    leftContent: (
      <BatteryFull
        color={batteryTintIconProps[BatteryTint.Red].color}
        size={33}
        style={{ transform: [{ rotate: '-90deg' }] }}
      />
    ),
  },
  [BatteryTint.Orange]: {
    leftContent: (
      <BatteryFull
        color={batteryTintIconProps[BatteryTint.Orange].color}
        size={33}
        style={{ transform: [{ rotate: '-90deg' }] }}
      />
    ),
  },
  [BatteryTint.Green]: {
    leftContent: (
      <BatteryFull
        color={batteryTintIconProps[BatteryTint.Green].color}
        size={33}
        style={{ transform: [{ rotate: '-90deg' }] }}
      />
    ),
  },
  [BatteryTint.Cyan]: {
    leftContent: (
      <BatteryFull
        color={batteryTintIconProps[BatteryTint.Cyan].color}
        size={33}
        style={{ transform: [{ rotate: '-90deg' }] }}
      />
    ),
  },
  [BatteryTint.Blue]: {
    leftContent: (
      <BatteryFull
        color={batteryTintIconProps[BatteryTint.Blue].color}
        size={33}
        style={{ transform: [{ rotate: '-90deg' }] }}
      />
    ),
  },
  [BatteryTint.Violet]: {
    leftContent: (
      <BatteryFull
        color={batteryTintIconProps[BatteryTint.Violet].color}
        size={33}
        style={{ transform: [{ rotate: '-90deg' }] }}
      />
    ),
  },
  [BatteryTint.None]: {
    leftContent: (
      <BatteryFull
        color={batteryTintIconProps[BatteryTint.None].color}
        size={33}
        style={{ transform: [{ rotate: '-90deg' }] }}
      />
    ),
  },
};
