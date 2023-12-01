export enum ChecklistActionRepeatingScheduleFrequency {
  Events = 'Events',
  ModelMinutes = 'Model Minutes',
  Days = 'Days',
  Weeks = 'Weeks',
  Months = 'Months',
};
export enum ChecklistActionNonRepeatingScheduleTimeframe {
  Events = 'Events',
  ModelMinutes = 'Model Minutes',
  Days = 'Days',
  Weeks = 'Weeks',
  Months = 'Months',
  Today = 'Today',
};

export type ChecklistAction = {
  id: string;
  description: string;
  repeatingSchedule?: {
      frequency: ChecklistActionRepeatingScheduleFrequency;
      value: number;
  }
  nonRepeatingSchedule?: {
      timeframe: ChecklistActionNonRepeatingScheduleTimeframe;
      value: number;
  }
  totalCost: number;
  notes: string;
};

export enum ChecklistTemplateType {
  PreEvent = 'Pre-Event',
  PostEvent = 'Post-Event',
  Maintenance = 'Maintenance',
};

export type ChecklistTemplate = {
  id: string;
  name: string;
  type: ChecklistTemplateType;
  actions: ChecklistAction[];
};
