import { Alert, ScrollView } from 'react-native';
import { AppTheme, useTheme } from 'theme';

import { Divider } from '@react-native-ajp-elements/ui';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'DatabaseInfo'>;

const DatabaseInfoScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  const resetDatabase = () => {
    return;
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'INFORMATION'} />
      <ListItem title={'Version'} value={'1'} position={['first']} rightImage={false} />
      <ListItem title={'Total Records'} value={'1'} rightImage={false} />
      <ListItem title={'Total Size'} value={'1'} rightImage={false} />
      <ListItem
        title={'Last Modified'}
        value={'Jan 13, 2024 at 6:23PM'}
        position={['last']}
        rightImage={false}
      />
      <Divider />
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
    color: theme.colors.clearButtonText,
  },
}));

export default DatabaseInfoScreen;
