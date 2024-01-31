import { AppTheme, useTheme } from 'theme';

import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelStatistics'>;

const ModelStatisticsScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
        <Text style={s.emptyMessage}>
          {'No Flights for Statistics'}
        </Text>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  emptyMessage: {
    ...theme.styles.textNormal,
    textAlign: 'center',
    top: '25%',
  }
}));

export default ModelStatisticsScreen;
