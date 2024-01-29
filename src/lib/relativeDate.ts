import { ISODateString, TimeSpan } from 'types/common';

import { DateTime } from 'luxon';
import { WheelPickerItem } from "components/atoms/WheelPicker";

export const getRelativeDate = (dateStr: ISODateString) => {
  const now = DateTime.now();
  const date = DateTime.fromISO(dateStr);
  const diff = now.diff(date, ['days']);

  if (diff.days < 1) {
    return 'Today';
  } else if (diff.days < 2) {
    return 'Yesterday';
  } else if (diff.days < 7) {
    return date.toFormat('EEEE');
  } else {
    return date.toFormat('M/d/yy');
  }
};

const timeSpanItems: WheelPickerItem[][] = [
  new Array(90).fill(null).map((_, index)=> ({label: `${index+1}`, value: `${index+1}`})),
  new Array(Object.values(TimeSpan).length).fill(null).map((_, index) => (
    {
      label: Object.values(TimeSpan)[index],
      value: Object.values(TimeSpan)[index]
    }
  )),
];

export const getTimeSpanItems = () => {
  const items = timeSpanItems;
  return {
    items,
    default: {
      // Arrays index as [wheel][item index in wheel]
      value: items[0][0].value as string,
      items: [ items[0][0].value as string, items[1][0].value as string ],
    }
  };
};
