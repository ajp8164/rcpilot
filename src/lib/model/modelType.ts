import { ModelType, ModelUIAttribute } from 'types/model';

export const modelUIAttributes: {[key in ModelType]: ModelUIAttribute} = {
  [ModelType.Airplane]: {icon:  ''},
  [ModelType.Sailplane]: {icon:  ''},
  [ModelType.Helicopter]: {icon:  ''},
  [ModelType.Multicopter]: {icon:  ''},
  [ModelType.Car]: {icon:  ''},
  [ModelType.Boat]: {icon:  ''},
  [ModelType.Robot]: {icon:  ''},
}