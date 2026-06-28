import React, { useContext, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListItem,
  ListItemSwipeable,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { Avatar } from 'components/molecules/Avatar';
import { appConfig } from 'config';
import { AuthContext, useUserProfile } from 'lib/auth';
import { useCommanderSummary } from 'lib/commander';
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
import { Commander } from 'realmdb/Commander';
// import { selectDatabaseAccessWith } from 'store/selectors/appSettingsSelectors';
import { selectCommander } from 'store/selectors/commanderSelectors';
import { saveDatabaseAccessWith } from 'store/slices/appSettings';
import { saveSelectedCommander } from 'store/slices/commander';
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
  const dispatch = useDispatch();
  const event = useEvent();
  const realm = useRealm();

  const auth = useContext(AuthContext);
  const userProfile = useUserProfile();

  const selectedCommanderId = useSelector(selectCommander).commanderId;
  const selectedCommander = useObject(
    Commander,
    new BSON.ObjectId(selectedCommanderId),
  );
  const commanderSummary = useCommanderSummary();

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

  const clearCommander = () => {
    // Replace current commander with unknown commander.
    const unknownCommander = realm
      .objects(Commander)
      .filtered('unknownCommander == true')[0];
    dispatch(
      saveSelectedCommander({
        commanderId: unknownCommander._id.toString(),
      }),
    );
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'COMMANDERS'} />
      {selectedCommander && !selectedCommander.unknownCommander && (
        <ListItemSwipeable
          title={selectedCommander.name}
          subtitle={commanderSummary(selectedCommander)}
          position={['first']}
          leftContent={<IdCard color={theme.colors.listItemIcon} />}
          rightContent={'chevron-right'}
          onPress={() =>
            navigation.navigate('Commander', {
              commanderId: selectedCommander._id.toString(),
            })
          }
          swipeableActionsRight={[
            {
              text: 'Clear',
              color: theme.colors.brandPrimary,
              ButtonComponent: <EyeOff color={theme.colors.stickyWhite} />,
              onPress: () => clearCommander,
            },
          ]}
        />
      )}
      <ListItem
        title={'Select or Create a Commander...'}
        position={
          selectedCommander && !selectedCommander.unknownCommander
            ? ['last']
            : ['first', 'last']
        }
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('Commanders')}
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
      ) : ( */}
        <ListItem
          title={'Web Server Access'}
          onPress={() => navigation.navigate('WebServerAccess')}
        />
      {/* )} */}
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
      <Divider text={'ACCOUNT'} />
      {userProfile ? (
        <ListItem
          title={userProfile.name || userProfile.email || 'My Account'}
          leftContent={<Avatar userProfile={userProfile} size={'list'} />}
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
      <Divider />
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

export default SetupScreen;
