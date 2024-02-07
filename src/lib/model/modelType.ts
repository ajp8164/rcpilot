import { EnumPickerIconProps } from 'components/EnumPickerScreen';
import { ModelType } from 'types/model';
import {theme} from 'theme';

const icon: EnumPickerIconProps = {
  name: '',
  type: 'svg',
  size: 50,
  color: theme.lightColors?.brandSecondary,
  style: { left: -10, transform: [{rotate: '-45deg'}] },
};

export const modelTypeIcons: {[key in ModelType]: EnumPickerIconProps} = {
  [ModelType.Airplane]: {...icon, name: 'airplane'},
  [ModelType.Sailplane]: {...icon, name: 'sailplane'},
  [ModelType.Helicopter]: {...icon, name: 'helicopter'},
  [ModelType.Multicopter]: {...icon, name: 'multicopter'},
  [ModelType.Car]: {...icon, name: 'car'},
  [ModelType.Boat]: {...icon, name: 'boat'},
  [ModelType.Robot]: {...icon, name: 'robot'},
}
