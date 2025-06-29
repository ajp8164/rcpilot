import { Alert, ScrollView, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import {
  MainNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';
import React, { useEffect } from 'react';

import { ChatAvatar } from 'components/molecules/ChatAvatar';
import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackActions } from '@react-navigation/native';
import { biometricAuthentication } from 'lib/biometricAuthentication';
import { makeStyles } from '@rn-vui/themed';
import { selectUserProfile } from 'store/selectors/userSelectors';
import { signOut } from 'lib/auth';
import { useSelector } from 'react-redux';

type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'UserAccount'>,
  NativeStackScreenProps<MainNavigatorParamList>
>;

const UserAccountScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

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
        <ChatAvatar
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
          leftImage={'account-circle-outline'}
          leftImageType={'material-community'}
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
          rightImage={false}
          onPress={confirmSignOut}
        />
      </ScrollView>
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  avatar: {
    alignSelf: 'center',
    marginTop: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  profileName: {
    ...theme.styles.textNormal,
    ...theme.styles.textBold,
    textAlign: 'center',
  },
  profileEmail: {
    ...theme.styles.textSmall,
    textAlign: 'center',
  },
  signInButtonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 15,
  },
  signOut: {
    ...theme.styles.textBold,
    textAlign: 'center',
    width: '100%',
    color: theme.colors.brandPrimary,
  },
}));

export default UserAccountScreen;
