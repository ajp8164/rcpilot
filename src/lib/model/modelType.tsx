import { ThemeManager, getColoredSvg } from '@react-native-hello/ui';
import { EnumPickerIconProps } from 'components/EnumPickerScreen';
import { SvgXml } from 'react-native-svg';
import { ModelType } from 'types/model';

type ModelTypeIconProps = {
  name: string;
};

export const modelTypeIconProps: { [key in ModelType]: ModelTypeIconProps } = {
  [ModelType.Airplane]: { name: 'airplane' },
  [ModelType.Boat]: { name: 'boat' },
  [ModelType.Car]: { name: 'car' },
  [ModelType.Helicopter]: { name: 'helicopter' },
  [ModelType.Multicopter]: { name: 'multicopter' },
  [ModelType.Robot]: { name: 'robot' },
  [ModelType.Sailplane]: { name: 'sailplane' },
};

export const modelTypeIcons: { [key in ModelType]: EnumPickerIconProps } = {
  [ModelType.Airplane]: {
    name: 'airplane',
    hideTitle: false,
    leftContent: (
      <SvgXml
        xml={getColoredSvg(modelTypeIconProps[ModelType.Airplane].name)}
        color={ThemeManager.theme.colors.brandSecondary}
        width={50}
        height={50}
        style={{ transform: [{ rotate: '-45deg' }] }}
      />
    ),
  },
  [ModelType.Boat]: {
    name: 'boat',
    hideTitle: false,
    leftContent: (
      <SvgXml
        xml={getColoredSvg(modelTypeIconProps[ModelType.Boat].name)}
        color={ThemeManager.theme.colors.brandSecondary}
        width={50}
        height={50}
        style={{ transform: [{ rotate: '-45deg' }] }}
      />
    ),
  },
  [ModelType.Car]: {
    name: 'car',
    hideTitle: false,
    leftContent: (
      <SvgXml
        xml={getColoredSvg(modelTypeIconProps[ModelType.Car].name)}
        color={ThemeManager.theme.colors.brandSecondary}
        width={50}
        height={50}
        style={{ transform: [{ rotate: '-45deg' }] }}
      />
    ),
  },
  [ModelType.Helicopter]: {
    name: 'helicopter',
    hideTitle: false,
    leftContent: (
      <SvgXml
        xml={getColoredSvg(modelTypeIconProps[ModelType.Helicopter].name)}
        color={ThemeManager.theme.colors.brandSecondary}
        width={50}
        height={50}
        style={{ transform: [{ rotate: '-45deg' }] }}
      />
    ),
  },
  [ModelType.Multicopter]: {
    name: 'multicopter',
    hideTitle: false,
    leftContent: (
      <SvgXml
        xml={getColoredSvg(modelTypeIconProps[ModelType.Multicopter].name)}
        color={ThemeManager.theme.colors.brandSecondary}
        width={50}
        height={50}
        style={{ transform: [{ rotate: '-45deg' }] }}
      />
    ),
  },
  [ModelType.Robot]: {
    name: 'robot',
    hideTitle: false,
    leftContent: (
      <SvgXml
        xml={getColoredSvg(modelTypeIconProps[ModelType.Robot].name)}
        color={ThemeManager.theme.colors.brandSecondary}
        width={50}
        height={50}
        style={{ transform: [{ rotate: '-45deg' }] }}
      />
    ),
  },
  [ModelType.Sailplane]: {
    name: 'sailplane',
    hideTitle: false,
    leftContent: (
      <SvgXml
        xml={getColoredSvg(modelTypeIconProps[ModelType.Sailplane].name)}
        color={ThemeManager.theme.colors.brandSecondary}
        width={50}
        height={50}
        style={{ transform: [{ rotate: '-45deg' }] }}
      />
    ),
  },
};
