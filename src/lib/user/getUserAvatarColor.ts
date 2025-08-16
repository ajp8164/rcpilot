import { hash } from 'lib/utils';
import { ColorValue } from 'react-native';

export const getUserAvatarColor = (userId: string, colors: ColorValue[]) => {
  return colors[hash(userId) % colors.length];
};
