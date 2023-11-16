import { BatteryTint } from 'types/battery';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemCheckbox } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewBatteryNavigatorParamList } from 'types/navigation';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<NewBatteryNavigatorParamList, 'BatteryTint'>;

const BatteryTintScreen = () => {
  const theme = useTheme();
  const options = Object.values(BatteryTint);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      {options.map((tint, index) => {
        return (
          <ListItemCheckbox
            key={index}
            title={tint}
            position={options.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === options.length - 1 ? ['last'] : []}
            checked={index === 0}
            onPress={() => null}
          />)
      })}
    </SafeAreaView>
  );
};

export default BatteryTintScreen;
