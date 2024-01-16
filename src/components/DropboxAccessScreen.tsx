import { AppTheme, useTheme } from 'theme';

import { Divider } from '@react-native-ajp-elements/ui';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView } from 'react-native';
import {
  SetupNavigatorParamList,
} from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'DropboxAccess'>;

const DropboxAccessScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  const note = 'All database backups are stored in the /Apps/RCPilot/Backups directory in your Dropbox.';

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'DATABASE BACKUPS'}/>
      <ListItem
        title={'Create Full Backup...'}
        position={['first']}
        rightImage={false}
      />
      <ListItem
        title={'Restore From Full Backup'}
        position={['last']}
      />
      <Divider type={'note'} text={note}/>
      <Divider text={'TEXT EXPORT & IMPORT'}/>
      <ListItem
        title={'Export to Text File...'}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider type={'note'} text={note}/>
      <ListItem
        title={'Import from Text File'}
        position={['first']}
      />
      <ListItem
        title={'Save Import Template...'}
        position={['last']}
        rightImage={false}
      />
      <Divider type={'note'} text={note}/>
      <ListItem
        title={'Sign in to Dropbox'}
        titleStyle={s.signin}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => {return}}
      />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  signin: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton,
  },
}));

export default DropboxAccessScreen;
