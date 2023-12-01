export enum ChecklistActionRepeatingScheduleFrequency {
  Events = 'Events',
  ModelMinutes = 'Model Minutes',
  Days = 'Days',
  Weeks = 'Weeks',
  Months = 'Months'
};
export enum ChecklistActionNonRepeatingScheduleFrequency {
  Events = 'Events',
  ModelMinutes = 'Model Minutes',
  Days = 'Days',
  Weeks = 'Weeks',
  Months = 'Months',
  Today = 'Today'
};

export enum ChecklistActionNonRepeatingScheduleFollowing {
  ModelEventAtInstallation = 'Model Event at Installation',
  ModelTimeAtInstallation = 'Model Time at Installation',
  InstallationDate = 'Installation Date'
};

export type ChecklistAction = {
  id: string;
  description: string;
  repeating: boolean;
  repeatingSchedule?: {
      frequency: ChecklistActionRepeatingScheduleFrequency;
      value: number;
  }
  nonRepeatingSchedule?: {
      frequency: ChecklistActionRepeatingScheduleFrequency;
      following: ChecklistActionNonRepeatingScheduleFollowing;
  }
  totalCost: number;
  notes: string;
};

export enum ChecklistTemplateType {
  PreEvent = 'Pre-Event',
  PostEvent = 'Post-Event',
  Maintenance = 'Maintenance'
};

export type ChecklistTemplate = {
  id: string;
  name: string;
  type: ChecklistTemplateType;
  actions: ChecklistAction[];
};
