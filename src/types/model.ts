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