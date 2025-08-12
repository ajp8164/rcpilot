import { Divider, ListItem } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rn-vui/themed';
import { appConfig } from 'config';
import React from 'react';
import { Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'WebServerAccess'
>;

const WebServerAccessScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <View style={[theme.styles.view, s.viewContainer]}>
      <Text style={s.heading}>{'Reaching the Web Server'}</Text>
      <Text
        style={
          s.text
        }>{`${appConfig.appName} information can be accessed from a web browser on your Mac or PC using the following URL.`}</Text>
      <ListItem
        title={'http://192.168.1.114:8080'}
        titleStyle={s.item}
        position={['first', 'last']}
      />
      <Divider />
      <Text style={s.heading}>{'Server Status'}</Text>
      <Text style={[s.text, s.centered]}>{'Server is ready...'}</Text>
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  viewContainer: {
    marginTop: '40%',
  },
  heading: {
    ...theme.styles.textHeading5,
    marginBottom: 15,
  },
  text: {
    ...theme.styles.textNormal,
    marginBottom: 15,
  },
  centered: {
    textAlign: 'center',
  },
  item: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.clearButtonText,
  },
}));

export default WebServerAccessScreen;
