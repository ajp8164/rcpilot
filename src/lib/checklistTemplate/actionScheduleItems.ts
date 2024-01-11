import {
  ChecklistActionNonRepeatingScheduleTimeframe,
  ChecklistActionRepeatingScheduleFrequency,
  ChecklistTemplateActionScheduleType
} from "types/checklistTemplate";

import { WheelPickerItem } from "components/atoms/WheelPicker";

// Fill values from numbers and enumeration values.
// Wheel picker array indexes as [wheel][item index in wheel]
// First wheel [0] = schedule value (e.g. 1).
// Second wheel [1] = schedule period (e.g. Events).

const checklistActionRepeatingScheduleItems: WheelPickerItem[][] = [
  new Array(730).fill(null).map((_, index)=> ({label: `${index+1}`, value: `${index+1}`})),
  new Array(Object.values(ChecklistActionRepeatingScheduleFrequency).length).fill(null).map((_, index) => (
    {
      label: Object.values(ChecklistActionRepeatingScheduleFrequency)[index],
      value: Object.values(ChecklistActionRepeatingScheduleFrequency)[index]
    }
  )),
];

const checklistActionNonRepeatingScheduleItems: WheelPickerItem[][] = [
  new Array(730).fill(null).map((_, index)=> ({label: `${index+1}`, value: `${index+1}`})),
  new Array(Object.values(ChecklistActionNonRepeatingScheduleTimeframe).length).fill(null).map((_, index) => (
    {
      label: Object.values(ChecklistActionNonRepeatingScheduleTimeframe)[index],
      value: Object.values(ChecklistActionNonRepeatingScheduleTimeframe)[index]
    }
  )),
];

export const getChecklistActionScheduleItems = (type?: ChecklistTemplateActionScheduleType) => {
  const items = type && type === ChecklistTemplateActionScheduleType.NonRepeating
    ? checklistActionNonRepeatingScheduleItems
    : checklistActionRepeatingScheduleItems;
  return {
    items,
    default: {
      // Arrays index as [wheel][item index in wheel]
      frequency: items[1][1].value as ChecklistActionRepeatingScheduleFrequency,
      timeframe: items[1][1].value as ChecklistActionNonRepeatingScheduleTimeframe,
      value: items[0][0].value as string,
      items: [ items[0][0].value as string, items[1][1].value as string ],
    }
  };
};
