import { ChecklistActionNonRepeatingScheduleTimeframe, ChecklistActionRepeatingScheduleFrequency } from "types/checklistTemplate";

import { WheelPickerItem } from "components/atoms/WheelPicker";

// Fill values from numbers and enumeration values.

export const checklistActionRepeatingScheduleItems: WheelPickerItem[][] = [
  new Array(730).fill(null).map((_, index)=> ({label: `${index+1}`, value: `${index+1}`})),
  new Array(Object.values(ChecklistActionRepeatingScheduleFrequency).length).fill(null).map((_, index) => (
    {
      label: Object.values(ChecklistActionRepeatingScheduleFrequency)[index],
      value: Object.values(ChecklistActionRepeatingScheduleFrequency)[index]
    }
  )),
];

export const checklistActionNonRepeatingScheduleItems: WheelPickerItem[][] = [
  new Array(730).fill(null).map((_, index)=> ({label: `${index+1}`, value: `${index+1}`})),
  new Array(Object.values(ChecklistActionNonRepeatingScheduleTimeframe).length).fill(null).map((_, index) => (
    {
      label: Object.values(ChecklistActionNonRepeatingScheduleTimeframe)[index],
      value: Object.values(ChecklistActionNonRepeatingScheduleTimeframe)[index]
    }
  )),
];
