import { AppTheme, useTheme } from 'theme';
import React, { useContext, useEffect } from 'react';
import { SetupNavigatorParamList, TabNavigatorParamList } from 'types/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useObject, useRealm } from '@realm/react';

import { AuthContext } from 'lib/auth';
import { BSON } from 'realm';
import { ChatAvatar } from 'components/molecules/ChatAvatar';
import { CompositeScreenProps } from '@react-navigation/core';
import { DatabaseAccessWith } from 'types/database';
import { Divider } from '@react-native-ajp-elements/ui';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { ScrollView } from 'react-native';
import { appConfig } from 'config';
import { makeStyles } from '@rneui/themed';
import { saveDatabaseAccessWith } from 'store/slices/appSettings';
import { saveSelectedPilot } from 'store/slices/pilot';
import { selectDatabaseAccessWith } from 'store/selectors/appSettingsSelectors';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { selectUserProfile } from 'store/selectors/userSelectors';
import { useEvent } from 'lib/event';
import { usePilotSummary } from 'lib/pilot';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'Setup'>,
  NativeStackScreenProps<TabNavigatorParamList>
>;

const SetupScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const dispatch = useDispatch();
  const event = useEvent();
  const realm = useRealm();

  const auth = useContext(AuthContext);
  const userProfile = useSelector(selectUserProfile);
  const selectedPilotId = useSelector(selectPilot).pilotId;
  const selectedPilot = useObject(Pilot, new BSON.ObjectId(selectedPilotId));
  const pilotSummary = usePilotSummary();

  const databaseAccessWith = useSelector(selectDatabaseAccessWith);

  useEffect(() => {
    if (route.params?.subNav) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigation.navigate(route.params.subNav as any); // Could not discern type.
      navigation.setParams({ subNav: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.subNav]);

  useEffect(() => {
    event.on('database-access-with', onChangeDatabaseAccessWith);
    return () => {
      event.removeListener('database-access-with', onChangeDatabaseAccessWith);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeDatabaseAccessWith = (result: EnumPickerResult) => {
    dispatch(saveDatabaseAccessWith({ value: result.value[0] as DatabaseAccessWith }));
  };

  const clearPilot = () => {
    // Replace current pilot with unknown pilot.
    const unknownPilot = realm.objects(Pilot).filtered('unknownPilot == true')[0];
    dispatch(
      saveSelectedPilot({
        pilotId: unknownPilot._id.toString(),
      }),
    );
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'PILOTS'} />
      {selectedPilot && !selectedPilot.unknownPilot && (
        <ListItem
          title={selectedPilot.name}
          subtitle={pilotSummary(selectedPilot)}
          position={['first']}
          onPress={() =>
            navigation.navigate('Pilot', {
              pilotId: selectedPilot._id.toString(),
            })
          }
          swipeable={{
            rightItems: [
              {
                icon: 'eye-slash',
                iconType: 'font-awesome',
                text: 'Clear',
                color: theme.colors.brandPrimary,
                x: 64,
                onPress: clearPilot,
              },
            ],
          }}
        />
      )}
      <ListItem
        title={'Select or Create a Pilot...'}
        position={selectedPilot && !selectedPilot.unknownPilot ? ['last'] : ['first', 'last']}
        onPress={() => navigation.navigate('Pilots')}
      />
      <Divider text={'GLOBALS'} />
      <ListItem
        title={'Event Locations'}
        position={['first']}
        onPress={() =>
          navigation.navigate('LocationNavigator', {
            screen: 'LocationsMap',
          })
        }
      />
      <ListItem title={'Event Styles'} onPress={() => navigation.navigate('EventStyles')} />
      <ListItem title={'Model Categories'} onPress={() => navigation.navigate('ModelCategories')} />
      <ListItem title={'Model Fuels'} onPress={() => navigation.navigate('ModelFuels')} />
      <ListItem title={'Model Propellers'} onPress={() => navigation.navigate('ModelPropellers')} />
      <ListItem
        title={'List Templates'}
        position={['last']}
        onPress={() => navigation.navigate('ChecklistTemplates')}
      />
      <Divider text={'DATABASE'} />
      <ListItem
        title={'Information'}
        position={['first']}
        onPress={() => navigation.navigate('DatabaseInfo')}
      />
      <ListItem
        title={'Access With'}
        value={databaseAccessWith}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'Access Database With',
            footer:
              'Specifies the method to use to access the database for backups, exports, imports, etc.',
            values: Object.values(DatabaseAccessWith),
            selected: databaseAccessWith,
            eventName: 'database-access-with',
          })
        }
      />
      {databaseAccessWith === DatabaseAccessWith.Dropbox ? (
        <ListItem title={'Dropbox Access'} onPress={() => navigation.navigate('DropboxAccess')} />
      ) : (
        <ListItem
          title={'Web Server Access'}
          onPress={() => navigation.navigate('WebServerAccess')}
        />
      )}
      <ListItem
        title={'Reporting'}
        position={['last']}
        onPress={() => navigation.navigate('DatabaseReporting')}
      />
      <Divider text={'PREFERENCES'} />
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
      <Divider text={'ACCOUNT'} />
      {userProfile ? (
        <ListItem
          title={userProfile.name || userProfile.email || 'My Account'}
          leftImage={<ChatAvatar userProfile={userProfile} avatarStyle={s.avatar} />}
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
      <Divider text={'MISCELLANEOUS'} />
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
      <Divider />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  avatar: {
    left: -3,
    top: 1,
  },
}));

export default SetupScreen;
