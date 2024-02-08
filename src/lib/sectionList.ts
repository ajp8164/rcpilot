import { SectionListData } from "react-native";

// Creates groups of items for a SectionList.
export const groupItems = <T, S>(
  items: T[] | Realm.Results<T>,
  groupTitle: (
    item: T,
    index: number,
    array: readonly T[]) => string)
: SectionListData<T, S>[] => {

  const groupedItems: {
    [key in string]: T[];
  } = {};

  items.forEach((item, index, array) => {
    const title = groupTitle(item, index, array);
    groupedItems[title] = groupedItems[title] || [];
    groupedItems[title].push(item);
  });

  const sectionData: SectionListData<T, S>[] = [];
  Object.keys(groupedItems).forEach(group => {
    return sectionData.push({
      title: group,
      data: groupedItems[group],
    } as unknown as SectionListData<T, S>);
  });

  return sectionData;
};
