import { AppTheme, useTheme } from 'theme';
import { Divider, ListItem } from '@react-native-ajp-elements/ui';
import React, { useContext, useEffect } from 'react';
import {
  SetupNavigatorParamList,
  TabNavigatorParamList,
} from 'types/navigation';

import { AuthContext } from 'lib/auth';
import { BSON } from 'realm';
import { ChatAvatar } from 'components/molecules/ChatAvatar';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { ScrollView } from 'react-native';
import { appConfig } from 'config';
import { makeStyles } from '@rneui/themed';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { selectUserProfile } from 'store/selectors/userSelectors';
import { useObject } from '@realm/react';
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
  const selectedPilotId = useSelector(selectPilot).pilotId;

  const selectedPilot = useObject(Pilot, new BSON.ObjectId(selectedPilotId));

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
      {selectedPilot &&
        <ListItem
          title={selectedPilot.name}
          subtitle={'Logged 12:35 over 7 events'}
          position={['first']}
          onPress={() => navigation.navigate('Pilot', {
            pilotId: '',
          })}
        />
      }
      <ListItem
        title={'Select or Create a Pilot...'}
        position={['last']}
        onPress={() => navigation.navigate('Pilots')}
      />
      <Divider text={'GLOBALS'}/>
      <ListItem
        title={'Event Locations'}
        position={['first']}
        onPress={() => navigation.navigate('LocationNavigator', {
          screen: 'Locations',
        })}
      />
      <ListItem
        title={'Event Styles'}
        onPress={() => navigation.navigate('EventStyles')}
      />
      <ListItem
        title={'Model Categories'}
        onPress={() => navigation.navigate('ModelCategories')}
      />
      <ListItem
        title={'Model Fuels'}
        onPress={() => navigation.navigate('ModelFuels')}
      />
      <ListItem
        title={'Model Propellers'}
        onPress={() => navigation.navigate('ModelPropellers')}
      />
      <ListItem
        title={'List Templates'}
        position={['last']}
        onPress={() => navigation.navigate('ChecklistTemplates')}
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
      <Divider text={'PREFERENCES'}/>
      <ListItem
        title={'Basics'}
        subtitle={'Units, screen dimming, filter behavior'}
        position={['first']}
        onPress={() => navigation.navigate('PreferencesBasics')}
      />
      <ListItem
        title={'Events'}
        subtitle={'Timer, sensitivity settings'}
        onPress={() => navigation.navigate('PreferencesEvents')}
      />
      <ListItem
        title={'Batteries'}
        subtitle={'Convenience options'}
        onPress={() => navigation.navigate('PreferencesBatteries')}
      />
      <ListItem
        title={'Audio'}
        subtitle={'Sounds, vibration, scheduling'}
        position={['last']}
        onPress={() => navigation.navigate('PreferencesAudio')}
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
