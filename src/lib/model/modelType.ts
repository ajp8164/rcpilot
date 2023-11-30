import { EnumPickerIconProps } from 'components/EnumPickerScreen';
import { ModelType } from 'types/model';

const icon: EnumPickerIconProps = {
  name: 'plane-up',
  size: 28,
  style: { width: 35 },
};

export const modelTypeIcons: {[key in ModelType]: EnumPickerIconProps} = {
  [ModelType.Airplane]: {...icon, color: 'blue'},
  [ModelType.Sailplane]: {...icon, color: 'blue'},
  [ModelType.Helicopter]: {...icon, color: 'blue'},
  [ModelType.Multicopter]: {...icon, color: 'blue'},
  [ModelType.Car]: {...icon, color: 'blue'},
  [ModelType.Boat]: {...icon, color: 'blue'},
  [ModelType.Robot]: {...icon, color: 'blue'},
}
