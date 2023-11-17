import { AppTheme, useTheme } from 'theme';
import React, { useEffect } from 'react';

import BatteryView from 'components/views/BatteryView';
import { Button } from '@rneui/base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewBatteryNavigatorParamList } from 'types/navigation';
import { View } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<NewBatteryNavigatorParamList, 'NewBattery'>;


const NewBatteryScreen = ({ navigation }: Props) => {  
  const theme = useTheme();
  const s = useStyles(theme);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          title={'Cancel'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
          onPress={navigation.goBack}
        />
      ),
      headerRight: () => (
        <Button
          title={'Save'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.saveButton]}
          onPress={() => null}
        />
      ),
    });
  }, []);

  return (
    <View style={[theme.styles.view]}>
      <BatteryView />
    </View>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  saveButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default NewBatteryScreen;
