export type ModelUIAttributes = {
  icon: string;
  iconColor: string;
};

export enum ModelType {
  Airplane = 'Airplane',
  Sailplane = 'Sailplane',
  Helicopter = 'Helicopter',
  Multicopter = 'Multicopter',
  Car = 'Car',
  Boat = 'Boat',
  Robot = 'Robot',
};

export enum ModelPropellerUnits {
  Inches = 'Inches',
  Centimeters = 'Centimeters',
};
