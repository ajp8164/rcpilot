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

export enum ChecklistType {
  PreFlight = 'Pre-Flight',
  PostFlight =  'Post-Flight',
  Maintenance = 'Maintenance',
}

export enum ChecklistFrequencyUnit {
  Event = 'Event',
  ModelMinute = 'Model Minute',
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
};

export type ChecklistAction = {
  description: string;
  frequencyValue: number;
  frequencyUnit: ChecklistFrequencyUnit;
  repeats: boolean;
  notes: string;
};

export type Checklist = {
  id: string;
  name: string;
  type: ChecklistType;
  actions: ChecklistAction[];
};

export type ModelCategory = {
  id: string;
  name: string;
};

export type ModelFuel = {
  id: string;
  name: string;
  cost: number;
  notes: string;
};

export enum ModelPropellerUnits {
  Inches = 'Inches',
  Centimeters = 'Centimeters',
};

export type ModelPropeller = {
  id: string;
  name: string;
  vendor: string;
  diameter: number;
  pitch: number;
  measuredUnits: ModelPropellerUnits;
  notes: string;
};
