import React, { useContext, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListItem,
  ListItemSwipeable,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { Avatar } from 'components/molecules/Avatar';
import { appConfig } from 'config';
import { AuthContext } from 'lib/auth';
import { usePilotSummary } from 'lib/pilot';
import {
  Archive,
  Battery,
  Blocks,
  CircleUserRound,
  Database,
  EyeOff,
  Fan,
  FileInput,
  Flag,
  Fuel,
  IdCard,
  Info,
  MapPinned,
  Route,
  Settings2,
  Settings,
  TextSelect,
  Volume2,
} from 'lucide-react-native';
import { BSON } from 'realm';
import { Pilot } from 'realmdb/Pilot';
// import { selectDatabaseAccessWith } from 'store/selectors/appSettingsSelectors';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { selectUserProfile } from 'store/selectors/userSelectors';
import { saveDatabaseAccessWith } from 'store/slices/appSettings';
import { saveSelectedPilot } from 'store/slices/pilot';
import { DatabaseAccessWith } from 'types/database';
import {
  SetupNavigatorParamList,
  TabNavigatorParamList,
} from 'types/navigation';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'Setup'>,
  NativeStackScreenProps<TabNavigatorParamList>
>;

const SetupScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const dispatch = useDispatch();
  const event = useEvent();
  const realm = useRealm();

  const auth = useContext(AuthContext);
  const userProfile = useSelector(selectUserProfile);
  const selectedPilotId = useSelector(selectPilot).pilotId;
  const selectedPilot = useObject(Pilot, new BSON.ObjectId(selectedPilotId));
  const pilotSummary = usePilotSummary();

  // const databaseAccessWith = useSelector(selectDatabaseAccessWith);

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
    dispatch(
      saveDatabaseAccessWith({ value: result.value[0] as DatabaseAccessWith }),
    );
  };

  const clearPilot = () => {
    // Replace current pilot with unknown pilot.
    const unknownPilot = realm
      .objects(Pilot)
      .filtered('unknownPilot == true')[0];
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
        <ListItemSwipeable
          title={selectedPilot.name}
          subtitle={pilotSummary(selectedPilot)}
          position={['first']}
          leftContent={<IdCard color={theme.colors.listItemIcon} />}
          rightContent={'chevron-right'}
          onPress={() =>
            navigation.navigate('Pilot', {
              pilotId: selectedPilot._id.toString(),
            })
          }
          swipeableActionsRight={[
            {
              text: 'Clear',
              color: theme.colors.brandPrimary,
              ButtonComponent: <EyeOff color={theme.colors.stickyWhite} />,
              onPress: () => clearPilot,
            },
          ]}
        />
      )}
      <ListItem
        title={'Select or Create a Pilot...'}
        position={
          selectedPilot && !selectedPilot.unknownPilot
            ? ['last']
            : ['first', 'last']
        }
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('Pilots')}
      />
      <Divider text={'GLOBALS'} />
      <ListItem
        title={'Event Locations'}
        position={['first']}
        leftContent={<MapPinned color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('LocationNavigator', {
            screen: 'LocationsMap',
            params: { enableLocationSelection: false },
          })
        }
      />
      <ListItem
        title={'Event Styles'}
        leftContent={<Route color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('EventStyles')}
      />
      <ListItem
        title={'Model Categories'}
        leftContent={<Blocks color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('ModelCategories')}
      />
      <ListItem
        title={'Model Fuels'}
        leftContent={<Fuel color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('ModelFuels')}
      />
      <ListItem
        title={'Model Propellers'}
        leftContent={<Fan color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('ModelPropellers')}
      />
      <ListItem
        title={'List Templates'}
        position={['last']}
        leftContent={<TextSelect color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('ChecklistTemplates')}
      />
      <Divider text={'DATABASE'} />
      <ListItem
        title={'Information'}
        position={['first']}
        leftContent={<Database color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('DatabaseInfo')}
      />
      {/* <ListItem
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
      /> */}
      {/* {databaseAccessWith === DatabaseAccessWith.Dropbox ? (
        <ListItem title={'Dropbox Access'} onPress={() => navigation.navigate('DatabaseBackup')} />
      ) : (
        <ListItem
          title={'Web Server Access'}
          onPress={() => navigation.navigate('WebServerAccess')}
        />
      )} */}
      <ListItem
        title={'Backup & Export'}
        leftContent={<Archive color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('DatabaseBackup')}
      />
      <ListItem
        title={'Reporting'}
        position={['last']}
        leftContent={<FileInput color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('DatabaseReporting')}
      />
      <Divider text={'PREFERENCES'} />
      <ListItem
        title={'Basics'}
        subtitle={'Units, screen dimming, filter behavior'}
        position={['first']}
        leftContent={<Settings2 color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('PreferencesBasics')}
      />
      <ListItem
        title={'Events'}
        subtitle={'Timer, sensitivity settings'}
        leftContent={<Flag color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('PreferencesEvents')}
      />
      <ListItem
        title={'Batteries'}
        subtitle={'Convenience options'}
        leftContent={<Battery color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('PreferencesBatteries')}
      />
      <ListItem
        title={'Audio'}
        subtitle={'Sounds, vibration, scheduling'}
        position={['last']}
        leftContent={<Volume2 color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('PreferencesAudio')}
      />
      <Divider text={'ACCOUNT'} />
      {userProfile ? (
        <ListItem
          title={userProfile.name || userProfile.email || 'My Account'}
          leftContent={
            <Avatar userProfile={userProfile} avatarStyle={s.avatar} />
          }
          position={['first', 'last']}
          rightContent={'chevron-right'}
          onPress={() => navigation.navigate('UserAccount')}
        />
      ) : (
        <ListItem
          title={'Sign In or Sign Up'}
          leftContent={<CircleUserRound color={theme.colors.listItemIcon} />}
          position={['first', 'last']}
          rightContent={'chevron-right'}
          onPress={() => auth.presentSignInModal()}
        />
      )}
      <Divider text={'MISCELLANEOUS'} />
      <ListItem
        title={'App Settings'}
        position={['first']}
        leftContent={<Settings color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('AppSettings')}
      />
      <ListItem
        title={`About ${appConfig.appName}`}
        position={['last']}
        leftContent={<Info color={theme.colors.listItemIcon} />}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('About')}
      />
      <Divider />
    </ScrollView>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  avatar: {
    left: -3,
    top: 1,
  },
}));

export default SetupScreen;
