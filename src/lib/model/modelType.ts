import { EnumPickerIconProps } from 'components/EnumPickerScreen';
import { ModelType } from 'types/model';

export const modelTypeIcons: {[key in ModelType]: EnumPickerIconProps} = {
  [ModelType.Airplane]: {name: 'plane-up', size: 28, style: { width: 35 }, color: 'blue'},
  [ModelType.Sailplane]: {name: 'plane-up', size: 28, style: { width: 35 }, color: 'blue'},
  [ModelType.Helicopter]: {name: 'plane-up', size: 28, style: { width: 35 }, color: 'blue'},
  [ModelType.Multicopter]: {name: 'plane-up', size: 28, style: { width: 35 }, color: 'blue'},
  [ModelType.Car]: {name: 'plane-up', size: 28, style: { width: 35 }, color: 'blue'},
  [ModelType.Boat]: {name: 'plane-up', size: 28, style: { width: 35 }, color: 'blue'},
  [ModelType.Robot]: {name: 'plane-up', size: 28, style: { width: 35 }, color: 'blue'},
}
