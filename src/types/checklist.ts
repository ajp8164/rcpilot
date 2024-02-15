export const ChecklistActionRepeatingScheduleFrequency = {
  Events:'Events',
  ModelMinutes: 'Model Minutes',
  Days: 'Days',
  Weeks: 'Weeks',
  Months: 'Months',
};

export const ChecklistActionNonRepeatingScheduleTimeframe = {
  Events:'Events',
  ModelMinutes: 'Model Minutes',
  Days: 'Days',
  Weeks: 'Weeks',
  Months: 'Months',
  Today: 'Today',
};

export const ChecklistActionSchedulePeriod = {
  ...ChecklistActionRepeatingScheduleFrequency,
  ...ChecklistActionNonRepeatingScheduleTimeframe
};

export type ChecklistActionSchedulePeriod = keyof typeof ChecklistActionSchedulePeriod;
export type ChecklistActionRepeatingScheduleFrequency = keyof typeof ChecklistActionRepeatingScheduleFrequency;
export type ChecklistActionNonRepeatingScheduleTimeframe = keyof typeof ChecklistActionNonRepeatingScheduleTimeframe;

export enum ChecklistActionScheduleWhenPerform {
  After = 'Perform After',
  Every = 'Every',
  In = 'Perform In',
  Now = 'Perform',
};

export enum ChecklistActionScheduleFollowing {
  EventAtInstall = 'Model Event at Installation',
  TimeAtInstall = 'Model Time at Installation',
  InstallDate = 'Installation Date',
};

export enum ChecklistType {
  PreEvent = 'Pre-Event',
  PostEvent = 'Post-Event',
  Maintenance = 'Maintenance',
};

export enum ChecklistActionScheduleType {
  NonRepeating = 'NonRepeating',
  Repeating = 'Repeating',
};
