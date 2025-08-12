import { Avatar as RNHAvatar, fontFamily } from '@react-native-hello/ui';
import { makeStyles } from '@rn-vui/themed';
import { CircleUserRound } from 'lucide-react-native';
import { TextStyle, ViewStyle } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import { fontSizes } from 'theme/styles';
import { UserProfile } from 'types/user';

interface AvatarInterface {
  avatarStyle?: ViewStyle;
  onPress?: () => void;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'giant';
  titleStyle?: TextStyle;
  userProfile?: UserProfile;
}

export const Avatar = (props: AvatarInterface) => {
  const {
    avatarStyle,
    onPress,
    size = 'tiny',
    titleStyle,
    userProfile,
  } = props;

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
        <RNHAvatar
          Icon={<CircleUserRound color={theme.colors.white} size={_iconSize} />}
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
        <RNHAvatar
          source={{ uri: userProfile.photoUrl }}
          imageProps={{ resizeMode: 'cover' }}
          containerStyle={[_avatarStyle, avatarStyle]}
          onPress={onPress}
        />
      );
    } else {
      return (
        <RNHAvatar
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
      <CircleUserRound
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
    fontSize: fontSizes.XL,
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
