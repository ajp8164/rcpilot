import { TimeSpan } from 'types/common';
import { WheelPickerItem } from 'components/atoms/WheelPicker';

const timeSpanItems: WheelPickerItem[][] = [
  new Array(90).fill(null).map((_, index) => ({ label: `${index + 1}`, value: `${index + 1}` })),
  new Array(Object.values(TimeSpan).length).fill(null).map((_, index) => ({
    label: Object.values(TimeSpan)[index],
    value: Object.values(TimeSpan)[index],
  })),
];

export const getTimeSpanItems = () => {
  const items = timeSpanItems;
  return {
    items,
    default: {
      // Arrays index as [wheel][item index in wheel]
      value: items[0][0].value as string,
      items: [items[0][0].value as string, items[1][0].value as string],
    },
  };
};
