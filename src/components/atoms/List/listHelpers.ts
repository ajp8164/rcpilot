// Return the correct list position array for the specified index.
export const listItemPosition = (index: number, listLength: number): ("first" | "last" | undefined)[] => {
  return listLength === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === listLength - 1 ? ['last'] : [];
};
