import { ModelType } from 'types/model';

export const modelHasPropeller = (type: ModelType) => {
  return [
    ModelType.Airplane,
    ModelType.Sailplane,
    ModelType.Multicopter,
  ].includes(type as ModelType);
};
