// Return the correct list position array for the specified index.
export const listItemPosition = (index: number, length: number): ("first" | "last" | undefined)[] => {
  return length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === length - 1 ? ['last'] : [];
};
