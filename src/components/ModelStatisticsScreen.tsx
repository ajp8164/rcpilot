import { EmptyView } from 'components/molecules/EmptyView';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelStatistics'>;

const ModelStatisticsScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;
  
  return (
    <EmptyView message={'No Events for Statistics'} />
  );
};

export default ModelStatisticsScreen;
