import { Divider, ListItem, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { DatabaseInfoContext } from 'lib/database';
import { DateTime } from 'luxon';
import React, { useContext } from 'react';
import { Alert, ScrollView } from 'react-native';
import { store } from 'store';
import { revertSettings } from 'store/actions';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'DatabaseInfo'
>;

const DatabaseInfoScreen = () => {
  const theme = useTheme();
  const realm = useRealm();

  const databaseInfo = useContext(DatabaseInfoContext);

  const resetDatabase = () => {
    realm.write(() => {
      realm.deleteAll();
    });

    store.dispatch(revertSettings());
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'INFORMATION'} />
      <ListItem
        title={'Version'}
        value={`v${databaseInfo.databaseVersion} (${DateTime.fromISO(databaseInfo.databaseVersionDate).toFormat('M/d/yyyy')})`}
        position={['first']}
      />
      <ListItem
        title={'Total Records'}
        value={`${databaseInfo.databaseObjects}`}
      />
      <ListItem
        title={'Total Size'}
        value={`${(databaseInfo.databaseSize / 1000000).toFixed(2)} MB`}
      />
      <ListItem
        title={'Last Modified'}
        value={DateTime.fromISO(databaseInfo.databaseLastUpdate).toFormat(
          "M/d/yyyy 'at' h:mm a",
        )}
        position={['last']}
      />
      <Divider />
      <Button
        title={'Reset Database'}
        titleStyle={theme.styles.buttonAssertiveTitle}
        buttonStyle={theme.styles.buttonAssertive}
        containerStyle={theme.styles.buttonContainer}
        outline
        onPress={() => {
          Alert.alert(
            'Reset Database?',
            'This will remove all records from your database leaving you with an empty database.\n\nThis operation cannot be undone.\n\nAre you absolutely sure you want to  reset your database?',
            [
              { text: 'Reset', onPress: resetDatabase, style: 'destructive' },
              { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: false },
          );
        }}
      />
    </ScrollView>
  );
};

export default DatabaseInfoScreen;
