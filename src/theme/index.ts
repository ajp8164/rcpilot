import { darkTheme } from './dark-theme';
import { lightTheme } from './light-theme';
import { ThemeManager } from '@react-native-hello/ui';

ThemeManager.update({
  light: lightTheme,
  dark: darkTheme,
});
