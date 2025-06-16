import { Alert, ScrollView } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React, { useContext } from 'react';

import { DatabaseInfoContext } from 'lib/database';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rn-vui/themed';
import { revertSettings } from 'store/actions';
import { store } from 'store';
import { useRealm } from '@realm/react';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'DatabaseInfo'>;

const DatabaseInfoScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);
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
        rightImage={false}
      />
      <ListItem
        title={'Total Records'}
        value={`${databaseInfo.databaseObjects}`}
        rightImage={false}
      />
      <ListItem
        title={'Total Size'}
        value={`${(databaseInfo.databaseSize / 1000000).toFixed(2)} MB`}
        rightImage={false}
      />
      <ListItem
        title={'Last Modified'}
        value={DateTime.fromISO(databaseInfo.databaseLastUpdate).toFormat("M/d/yyyy 'at' h:mm a")}
        position={['last']}
        rightImage={false}
      />
      <Divider text={'DANGER ZONE'} />
      <ListItem
        title={'Reset Database'}
        titleStyle={s.reset}
        position={['first', 'last']}
        rightImage={false}
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

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  reset: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.assertive,
  },
}));

export default DatabaseInfoScreen;
