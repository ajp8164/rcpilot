import {
  Divider,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { StackActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from 'components/molecules/Avatar';
import { signOut } from 'lib/auth';
import { biometricAuthentication } from 'lib/biometricAuthentication';
import { CircleUserRound } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectUserProfile } from 'store/selectors/userSelectors';
import {
  MainNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';

type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'UserAccount'>,
  NativeStackScreenProps<MainNavigatorParamList>
>;

const UserAccountScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();

  const userProfile = useSelector(selectUserProfile);

  useEffect(() => {
    // Wait for sign out to complete before navigating away.
    if (!userProfile) {
      navigation.dispatch(StackActions.popToTop());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  const confirmSignOut = async () => {
    await biometricAuthentication()
      .then(() => {
        Alert.alert(
          'Confirm Signing Out',
          'Are you sure you want to signout?',
          [
            {
              text: 'Yes, sign out',
              style: 'destructive',
              onPress: signOut,
            },
            {
              text: 'No',
              style: 'cancel',
            },
          ],
          { cancelable: false },
        );
      })
      .catch();
  };

  return (
    <View>
      <ScrollView
        style={theme.styles.view}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Avatar
          userProfile={userProfile}
          size={'giant'}
          avatarStyle={s.avatar}
        />
        {userProfile?.name && (
          <Text style={s.profileName}>{userProfile.name}</Text>
        )}
        {userProfile?.email && (
          <Text style={s.profileEmail}>{userProfile.email}</Text>
        )}
        <Divider />
        <ListItem
          title={'Edit Profile'}
          leftContent={<CircleUserRound color={theme.colors.listItemIcon} />}
          position={['first', 'last']}
          onPress={() =>
            navigation.navigate('UserProfile', {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              userProfile: userProfile!,
            })
          }
        />
        <Divider />
        <ListItem
          title={'Sign Out'}
          titleStyle={s.signOut}
          position={['first', 'last']}
          onPress={confirmSignOut}
        />
      </ScrollView>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  avatar: {
    alignSelf: 'center',
    marginTop: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  profileName: {
    ...theme.text.normal,
    fontFamily: theme.fonts.bold,
    textAlign: 'center',
  },
  profileEmail: {
    ...theme.text.small,
    textAlign: 'center',
  },
  signInButtonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 15,
  },
  signOut: {
    fontFamily: theme.fonts.bold,
    textAlign: 'center',
    width: '100%',
    color: theme.colors.brandPrimary,
  },
}));

export default UserAccountScreen;
