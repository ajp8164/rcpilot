import { theme } from "theme";

// Return the correct list position array for the specified index.
export const listItemPosition = (index: number, listLength: number): ("first" | "last" | undefined)[] => {
  return listLength === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === listLength - 1 ? ['last'] : [];
};

// Defined for all list item delete swipeable.
export const swipeableDeleteItem = {
  light: {
    icon: 'trash',
    iconType: 'font-awesome',
    text: 'Delete',
    color: theme.lightColors?.assertive,
    x: 64,
  },
  dark: {
    icon: 'trash',
    iconType: 'font-awesome',
    text: 'Delete',
    color: theme.darkColors?.assertive,
    x: 64,
  }
};
