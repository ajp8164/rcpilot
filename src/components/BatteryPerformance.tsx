import { Text, View } from 'react-native';

import ActionBar from 'components/atoms/ActionBar';
import { BatteriesNavigatorParamList } from 'types/navigation';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryPerformance'>;

const BatteryPerformanceScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  return (
    <View style={theme.styles.view}>
      <Text>{'Performance'}</Text>
      <ActionBar
        actions={[
          {
            ActionComponent: (<Icon name={'filter'} size={28} color={theme.colors.brandPrimary} />),
            onPress: () => null
          }, {
            ActionComponent: (<Icon name={'scale-unbalanced-flip'} size={28} color={theme.colors.brandPrimary} />),
            onPress: () => null
          }, {
            label: 'Done',
            onPress: navigation.goBack
          },
        ]}
      />
    </View>
  );
};

export default BatteryPerformanceScreen;