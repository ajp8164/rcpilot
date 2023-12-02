import { checklistActionNonRepeatingScheduleItems, checklistActionRepeatingScheduleItems } from './checklistAction';

import { ChecklistAction } from "types/checklistTemplate";

export const getChecklistActionScheduleItems = (action: ChecklistAction) => {
  const items = action.nonRepeatingSchedule ? checklistActionNonRepeatingScheduleItems : checklistActionRepeatingScheduleItems;
  const defaultValue = [ items[0][0].value as string, items[1][0].value as string];
  return {
    items,
    defaultValue
  };
};
