import { AppTheme, useTheme } from 'theme';
import { Avatar, Icon } from '@rn-vui/base';
import { TextStyle, ViewStyle } from 'react-native';

import { UserProfile } from 'types/user';
import { fontFamily } from '@react-native-ajp-elements/ui';
import { fontSizes } from 'theme/styles';
import { makeStyles } from '@rn-vui/themed';

interface ChatAvatarInterface {
  avatarStyle?: ViewStyle;
  onPress?: () => void;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'giant';
  titleStyle?: TextStyle;
  userProfile?: UserProfile;
}

export const ChatAvatar = ({
  avatarStyle,
  onPress,
  size = 'tiny',
  titleStyle,
  userProfile,
}: ChatAvatarInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const _avatarStyle =
    size === 'tiny'
      ? s.avatarTiny
      : size === 'small'
        ? s.avatarSmall
        : size === 'medium'
          ? s.avatarMedium
          : size === 'large'
            ? s.avatarLarge
            : s.avatarGiant;

  const _titleStyle =
    size === 'tiny'
      ? s.avatarTitleTiny
      : size === 'small'
        ? s.avatarTitleSmall
        : size === 'medium'
          ? s.avatarTitleMedium
          : size === 'large'
            ? s.avatarTitleLarge
            : s.avatarTitleGiant;

  const _iconSize =
    size === 'tiny'
      ? 20
      : size === 'small'
        ? 24
        : size === 'medium'
          ? 28
          : size === 'large'
            ? 36
            : 60;

  const renderUserAvatar = (userProfile?: UserProfile) => {
    if (!userProfile) {
      return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <Avatar
          icon={{
            name: 'account-outline',
            type: 'material-community',
            size: _iconSize,
            color: theme.colors.white,
          }}
          imageProps={{ resizeMode: 'cover' }}
          containerStyle={{
            ..._avatarStyle,
            backgroundColor: theme.colors.subtleGray,
            ...avatarStyle,
          }}
          onPress={onPress}
        />
      );
    } else if (userProfile?.photoUrl.length) {
      return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <Avatar
          source={{ uri: userProfile.photoUrl }}
          imageProps={{ resizeMode: 'cover' }}
          containerStyle={[_avatarStyle, avatarStyle]}
          onPress={onPress}
        />
      );
    } else {
      return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <Avatar
          title={userProfile?.avatar.title}
          titleStyle={[_titleStyle, titleStyle]}
          containerStyle={{
            ..._avatarStyle,
            backgroundColor:
              userProfile?.avatar.color || theme.colors.subtleGray,
            ...avatarStyle,
          }}
          onPress={onPress}
        />
      );
    }
  };

  // Request is for single user

  if (!userProfile) {
    // Seems to be a bug which allows the previous avatar image to remain
    // displayed. Use an icon to avoid.
    return (
      // eslint-disable-next-line react/react-in-jsx-scope
      <Icon
        name={'account-circle'}
        type={'material-community'}
        color={theme.colors.brandSecondary}
        size={(avatarStyle?.width as number) || (_avatarStyle.width as number)}
        onPress={onPress}
      />
    );
  }

  return renderUserAvatar(userProfile);
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  avatarGiant: {
    width: 100,
    height: 100,
    borderRadius: 100,
    overflow: 'hidden',
  },
  avatarLarge: {
    width: 55,
    height: 55,
    borderRadius: 55,
    overflow: 'hidden',
  },
  avatarMedium: {
    width: 42,
    height: 42,
    borderRadius: 42,
    overflow: 'hidden',
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 34,
    overflow: 'hidden',
  },
  avatarTiny: {
    width: 30,
    height: 30,
    borderRadius: 30,
    overflow: 'hidden',
  },
  avatarTitleGiant: {
    color: theme.colors.stickyWhite,
    fontSize: fontSizes.giant,
    fontFamily,
    fontWeight: 'normal',
  },
  avatarTitleLarge: {
    color: theme.colors.stickyWhite,
    fontSize: fontSizes.xl,
    fontFamily,
    fontWeight: 'normal',
  },
  avatarTitleMedium: {
    color: theme.colors.stickyWhite,
    fontSize: fontSizes.large,
    fontFamily,
    fontWeight: 'normal',
  },
  avatarTitleSmall: {
    color: theme.colors.stickyWhite,
    fontSize: fontSizes.normal,
    fontFamily,
    fontWeight: 'normal',
  },
  avatarTitleTiny: {
    color: theme.colors.stickyWhite,
    fontSize: fontSizes.normal,
    fontFamily,
    fontWeight: 'normal',
  },
}));
