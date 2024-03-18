import { hash } from 'lib/utils';

export const getUserAvatarColor = (userId: string, colors: string[]) => {
  return colors[hash(userId) % colors.length];
};
