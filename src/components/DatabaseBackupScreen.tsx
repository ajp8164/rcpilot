import { AppTheme, useTheme } from 'theme';

import { Divider } from '@react-native-ajp-elements/ui';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { makeStyles } from '@rneui/themed';
import { useRealm } from '@realm/react';
import { DateTime } from 'luxon';
import { saveFile, File } from 'firebase/storage';
import { useSelector } from 'react-redux';
import { selectUser } from 'store/selectors/userSelectors';
import { DatabaseInfoContext } from 'lib/database';
import { Directory, listFiles } from 'firebase/storage/operations';
import { appConfig } from 'config';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'DatabaseBackup'>;

const DatabaseBackupScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const realm = useRealm();
  const user = useSelector(selectUser);
  const databaseInfo = useContext(DatabaseInfoContext);

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [dir, setDir] = useState<Directory>();
  const [backupAllowed, setBackupAllowed] = useState(true);

  const note = `You are provided with ${appConfig.storageAllocation / 1000000}MB of database backup storage. If the size of a new backup would exceed your storage limit then you must delete older backups as needed.`;

  useFocusEffect(() => {
    getFiles();
  });

  const getFiles = () => {
    listFiles({
      storagePath: `users/${user.profile?.id}/backups/`,
      onSuccess: dir => {
        setDir(dir);
        setBackupAllowed(dir && dir?.allocated + databaseInfo.databaseSize < 5000000);
      },
    });
  };

  const createBackup = () => {
    setIsBackingUp(true);
    const source = realm.path;
    const timestamp = DateTime.now().toUnixInteger();
    const filename = `backup-v${databaseInfo.databaseVersion}-${timestamp}.realm`;

    saveFile({
      file: {
        mimeType: 'application/octet-stream',
        uri: source,
      } as File,
      storagePath: `users/${user.profile?.id}/backups/`,
      destFilename: filename,
      onSuccess: () => {
        setIsBackingUp(false);
        Alert.alert(
          'Backup Complete',
          'You database has been backed up. You can resore this backup from the database restore screen.',
        );
      },
      onError: () => {
        setIsBackingUp(false);
        Alert.alert(
          'Backup Did Not Complete',
          'You database has not been backed up. Please check your network connection and try again.',
        );
      },
    });
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'DATABASE BACKUPS'} />
      <ListItem
        title={'Create Full Backup'}
        value={
          backupAllowed ? (
            <ActivityIndicator color={theme.colors.brandPrimary} animating={isBackingUp} />
          ) : (
            'At storage limit'
          )
        }
        titleStyle={backupAllowed ? {} : theme.styles.textDim}
        valueStyle={s.backupValue}
        disabled={isBackingUp || !backupAllowed}
        position={['first']}
        rightImage={false}
        onPress={createBackup}
      />
      <ListItem
        title={'Restore From Full Backup'}
        subtitle={`${dir && (dir?.allocated / 1000000).toFixed(3)}MB storage used`}
        position={['last']}
        onPress={() => navigation.navigate('DatabaseBackups')}
      />
      <Divider note text={note} />
      <Divider text={'TEXT EXPORT & IMPORT'} />
      <ListItem title={'Export to Text File...'} position={['first', 'last']} rightImage={false} />
      <Divider />
      <ListItem title={'Import from Text File'} position={['first']} />
      <ListItem title={'Save Import Template...'} position={['last']} rightImage={false} />
      <Divider />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  backupValue: {
    color: theme.colors.assertive,
    opacity: 1,
    paddingRight: 0,
  },
}));

export default DatabaseBackupScreen;
