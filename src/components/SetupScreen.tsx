import { AppTheme, useTheme } from 'theme';
import { Divider, ListItem } from '@react-native-ajp-elements/ui';
import React, { useContext, useEffect } from 'react';
import {
  SetupNavigatorParamList,
  TabNavigatorParamList,
} from 'types/navigation';

import { AuthContext } from 'lib/auth';
import { ChatAvatar } from 'components/molecules/ChatAvatar';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import { appConfig } from 'config';
import { makeStyles } from '@rneui/themed';
import { selectUserProfile } from 'store/selectors/userSelectors';
import { useSelector } from 'react-redux';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'Setup'>,
  NativeStackScreenProps<TabNavigatorParamList>
>;

const SetupScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const auth = useContext(AuthContext);
  const userProfile = useSelector(selectUserProfile);

  useEffect(() => {
    if (route.params?.subNav) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigation.navigate(route.params.subNav as any); // Could not discern type.
      navigation.setParams({ subNav: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.subNav]);

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'PILOTS'}/>
      <ListItem
        title={'Andy Phillipson'}
        subtitle={'Logged 12:35 over 7 events'}
        position={['first']}
        onPress={() => null}
      />
      <ListItem
        title={'Select or Create a Pilot...'}
        position={['last']}
        onPress={() => null}
      />
      <Divider text={'GLOBALS'}/>
      <ListItem
        title={'Event Locations'}
        position={['first']}
        onPress={() => null}
      />
      <ListItem
        title={'Event Styles'}
        onPress={() => null}
      />
      <ListItem
        title={'Model Categories'}
        onPress={() => null}
      />
      <ListItem
        title={'Model Fuels'}
        onPress={() => null}
      />
      <ListItem
        title={'Model Propellers'}
        onPress={() => null}
      />
      <ListItem
        title={'List Templates'}
        position={['last']}
        onPress={() => null}
      />
      <Divider text={'DATABASE'}/>
      <ListItem
        title={'Vitals'}
        position={['first']}
        onPress={() => null}
      />
      <ListItem
        title={'Access With'}
        value={'Dropbox'}
        onPress={() => null}
      />
      <ListItem
        title={'Dropbox Access'}
        onPress={() => null}
      />
      <ListItem
        title={'Reporting'}
        position={['last']}
        onPress={() => null}
      />
      <Divider text={'ACCOUNT'}/>
      {userProfile ? (
        <ListItem
          title={userProfile.name || userProfile.email || 'My Account'}
          leftImage={
            <ChatAvatar userProfile={userProfile} avatarStyle={s.avatar} />
          }
          position={['first', 'last']}
          onPress={() => navigation.navigate('UserAccount')}
        />
      ) : (
        <ListItem
          title={'Sign In or Sign Up'}
          leftImage={'account-circle-outline'}
          leftImageType={'material-community'}
          position={['first', 'last']}
          onPress={() => auth.presentSignInModal()}
        />
      )}
      <Divider text={'MISCELLANEOUS'}/>
      <ListItem
        title={'App Settings'}
        position={['first']}
        leftImage={'cog-outline'}
        leftImageType={'material-community'}
        onPress={() => navigation.navigate('AppSettings')}
      />
      <ListItem
        title={`About ${appConfig.appName}`}
        position={['last']}
        leftImage={'information-outline'}
        leftImageType={'material-community'}
        onPress={() => navigation.navigate('About')}
      />
      <Divider/>
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  avatar: {
    left: -3,
    top: 1,
  },
  emptyListContainer: {},
}));

export default SetupScreen;