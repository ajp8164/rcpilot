import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Platform,
  View,
} from 'react-native';
import { useTheme } from 'theme';
import React, { useEffect, useState } from 'react';

import {
  ListItem,
  listItemPosition,
  swipeableDeleteItem,
} from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { Divider } from '@react-native-ajp-elements/ui';
import { deleteFile as storageDeleteFile } from 'firebase/storage/file';
import { Directory, File, listFiles } from 'firebase/storage/operations';
import { useSelector } from 'react-redux';
import { selectUser } from 'store/selectors/userSelectors';
import { DateTime } from 'luxon';
import RNFS from 'react-native-fs';
import { useRealm } from '@realm/react';
import { useConfirmAction } from 'lib/useConfirmAction';
import { appConfig } from 'config';
import { EmptyView } from 'components/molecules/EmptyView';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'DatabaseBackups'
>;

const DatabaseBackupsScreen = () => {
  const theme = useTheme();
  const realm = useRealm();
  const confirmAction = useConfirmAction();
  const user = useSelector(selectUser);

  const [dir, setDir] = useState<Directory>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string>();

  useEffect(() => {
    getFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFiles = () => {
    setIsLoading(true);
    listFiles({
      storagePath: `users/${user.profile?.id}/backups/`,
      onSuccess: dir => {
        setDir(dir);
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };

  const restoreFromBackup = (file: File) => {
    setIsRestoring(file.name);
    const path = `${Platform.OS === 'android' ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath}`;

    RNFS.downloadFile({
      fromUrl: file.url,
      toFile: `${path}/${file.name}`,
    })
      .promise.then(async () => {
        // Move current database to allow recovery if needed. Put the restored database in place.
        await RNFS.moveFile(realm.path, `${realm.path}.recovery`);
        await RNFS.moveFile(`${path}/${file.name}`, realm.path);
        await RNFS.unlink(`${realm.path}.recovery`);
        Alert.alert(
          'Database Restored',
          `Your database backup from ${DateTime.fromISO(file.date).toFormat("M/d/yyyy 'at' h:mm a")} has been restored from backup.\n\nYou MUST close and reopen the app to re-read the database.`,
        );
        setIsRestoring(undefined);
      })
      .catch(() => {
        Alert.alert(
          'Database Not Restored',
          'You database has been not restored. your existing database is unchanged.',
        );
        setIsRestoring(undefined);
      });
  };

  const deleteFile = (file: File) => {
    storageDeleteFile({
      filename: file.name,
      storagePath: `users/${user.profile?.id}/backups/`,
      onSuccess: () => {
        getFiles();
      },
      onError: () => {
        Alert.alert(
          'Backup File Not Deleted',
          'The file could not be deleted. Please try again.',
        );
      },
    });
  };

  const renderBackup: ListRenderItem<File> = ({ item: file, index }) => {
    const dbVersion = file.name.split('-')[1];
    return (
      <ListItem
        title={DateTime.fromISO(file.date).toFormat("M/d/yyyy 'at' h:mm a")}
        subtitle={`Database ${dbVersion}, ${Math.round(file.size / 1000)}MB`}
        value={
          <ActivityIndicator
            color={theme.colors.brandPrimary}
            animating={isRestoring === file.name}
          />
        }
        position={listItemPosition(index, dir?.files.length || 0)}
        rightImage={false}
        onPress={() => {
          confirmAction(restoreFromBackup, {
            label: 'Restore Database',
            title:
              'This action cannot be undone.\nAre you sure you want to restore your database?',
            value: file,
          });
        }}
        swipeable={{
          rightItems: [
            {
              ...swipeableDeleteItem[theme.mode],
              onPress: () => {
                const label = 'Delete Backup';
                confirmAction(deleteFile, {
                  label,
                  title:
                    'This action cannot be undone.\nAre you sure you want to delete this backup?',
                  value: file,
                });
              },
            },
          ],
        }}
      />
    );
  };

  if (!isLoading && !dir?.files.length) {
    return (
      <EmptyView
        info
        message={'No Database Backups'}
        details={
          'Tap Create Backup on the previous screen to backup your database.'
        }
      />
    );
  }

  return (
    <View style={theme.styles.view}>
      <Divider
        note
        text={`You are provided with ${appConfig.storageAllocation / 1000000}MB of database backup storage. Your current allocation is ${dir && (dir?.allocated / 1000000).toFixed(3)}MB across ${dir?.files.length} backups. Tap a backup to restore, swipe left to delete.`}
      />
      <FlatList
        data={dir?.files.sort().reverse()}
        renderItem={renderBackup}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ActivityIndicator color={theme.colors.brandPrimary} />
        }
      />
    </View>
  );
};

export default DatabaseBackupsScreen;
