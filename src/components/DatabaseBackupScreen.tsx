import React, { useContext, useState } from 'react';
import { Alert, ScrollView } from 'react-native';

import { Divider, ListItem, useTheme } from '@react-native-hello/ui';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { appConfig } from 'config';
import { File, saveFile } from 'firebase/storage';
import { Directory, listFiles } from 'firebase/storage/operations';
import { useUserProfile } from 'lib/auth';
import { DatabaseInfoContext } from 'lib/database';
import { DateTime } from 'luxon';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'DatabaseBackup'
>;

const DatabaseBackupScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const realm = useRealm();
  // const user = useSelector(selectUser);
  const userProfile = useUserProfile();
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
      storagePath: `users/${userProfile?.id}/backups/`,
      onSuccess: dir => {
        setDir(dir);
        setBackupAllowed(
          dir &&
            dir?.allocated + databaseInfo.info.databaseSize <
              appConfig.storageAllocation,
        );
      },
    });
  };

  const createBackup = () => {
    setIsBackingUp(true);
    const source = realm.path;
    const timestamp = DateTime.now().toUnixInteger();
    const filename = `backup-v${databaseInfo.info.databaseVersion}-${timestamp}.realm`;

    saveFile({
      file: {
        mimeType: 'application/octet-stream',
        uri: source,
      } as File,
      storagePath: `users/${userProfile?.id}/backups/`,
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
        title={'Restore From Full Backup'}
        subtitle={`${dir && (dir?.allocated / 1000000).toFixed(3)}MB storage used`}
        position={['last']}
        rightContent={'chevron-right'}
        onPress={() => navigation.navigate('DatabaseBackups')}
      />
      <Divider />
      <Button
        title={'Create Full Backup'}
        containerStyle={theme.styles.buttonContainer}
        outline
        disabled={isBackingUp || !backupAllowed}
        onPress={createBackup}
      />
      <Divider note light subHeaderStyle={theme.text.medium} text={note} />
      <Divider text={'TEXT EXPORT & IMPORT'} />
      <ListItem title={'Export to Text File...'} position={['first', 'last']} />
      <Divider />
      <ListItem title={'Import from Text File'} position={['first']} />
      <ListItem title={'Save Import Template...'} position={['last']} />
      <Divider />
    </ScrollView>
  );
};

export default DatabaseBackupScreen;
