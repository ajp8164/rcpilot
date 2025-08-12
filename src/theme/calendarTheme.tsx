import { useTheme } from 'theme';

export const useCalendarTheme = () => {
  const theme = useTheme();
  return {
    calendarBackground: theme.colors.viewBackground,
    expandableKnobColor: theme.colors.brandPrimary,
  };
};
