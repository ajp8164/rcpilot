export enum ChecklistActionRepeatingScheduleFrequency {
  Events = 'Events',
  ModelMinutes = 'Model Minutes',
  Days = 'Days',
  Weeks = 'Weeks',
  Months = 'Months',
}

export enum ChecklistActionNonRepeatingScheduleTimeframe {
  Events = 'Events',
  ModelMinutes = 'Model Minutes',
  Days = 'Days',
  Weeks = 'Weeks',
  Months = 'Months',
  Today = 'Today',
}

export const ChecklistActionSchedulePeriod = {
  ...ChecklistActionRepeatingScheduleFrequency,
  ...ChecklistActionNonRepeatingScheduleTimeframe,
};

export type ChecklistActionSchedulePeriod =
  | ChecklistActionRepeatingScheduleFrequency
  | ChecklistActionNonRepeatingScheduleTimeframe;

export enum ChecklistActionScheduleWhenPerform {
  After = 'Perform After',
  Every = 'Every',
  In = 'Perform In',
  Now = 'Perform',
}

export enum ChecklistActionScheduleFollowing {
  EventAtInstall = 'Model Event at Installation',
  TimeAtInstall = 'Model Time at Installation',
  InstallDate = 'Installation Date',
}

export enum ChecklistType {
  PreEvent = 'Pre-Event',
  PostEvent = 'Post-Event',
  Maintenance = 'Maintenance',
  OneTimeMaintenance = 'One-Time Maintenance',
}

export type EventSequenceChecklistType =
  | ChecklistType.PreEvent
  | ChecklistType.PostEvent;

export enum ChecklistActionScheduleType {
  NonRepeating = 'NonRepeating',
  Repeating = 'Repeating',
}
