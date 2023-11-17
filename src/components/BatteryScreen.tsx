import { AppTheme, useTheme } from 'theme';

import { BatteriesNavigatorParamList } from 'types/navigation';
import BatteryView from 'components/views/BatteryView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'Battery'>;

const BatteryScreen = ({ route, navigation }: Props) => {
  const { batteryId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  navigation.setOptions({
    headerRight: ()  => {
      return (
        <>
          <Icon
            name={'chevron-up'}
            style={s.headerIcon}
            onPress={() => null}/>
          <Icon
            name={'chevron-down'}
            style={s.headerIcon}
            onPress={() => null}/>
        </>
      );
    },
  });

  return (
    <View style={theme.styles.view}>
      <BatteryView batteryId={batteryId} />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  editButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  headerIcon: {
    color: theme.colors.brandPrimary,
    fontSize: 22,
    marginHorizontal: 10,
  },
}));

export default BatteryScreen;
