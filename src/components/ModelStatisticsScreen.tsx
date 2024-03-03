import { BSON } from 'realm';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { ListItem } from 'components/atoms/List';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { eventKind } from 'lib/event';
import { secondsToMSS } from 'lib/formatters';
import { useCurrencyFormatter } from 'lib/useCurrencyFormatter';
import { useObject } from '@realm/react';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelStatistics'>;

const ModelStatisticsScreen = ({ route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const formatCurrency = useCurrencyFormatter();

  const model = useObject(Model, new BSON.ObjectId(modelId));
  
  if (!model) {
    return (
      <EmptyView error message={'Model Not Found!'} />
    );    
  };

  return (
    <View style={theme.styles.view}>
      <Divider text={`${eventKind(model.type).name.toUpperCase()} DURATION AVERAGES`} />
      <ListItem
        title={'style name'}
        value={'100%, 0:18'}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider type={'note'} text={`Lists percentage of ${eventKind(model.type).namePlural.toLowerCase()} and average duration (M:SS) of logged ${eventKind(model.type).namePlural.toLowerCase()} for each style.`} />
      <ListItem
        title={'Total Time'}
        value={`${model.totalEvents} ${eventKind(model.type).namePlural.toLowerCase()}, ${secondsToMSS(model.totalTime, {format: 'm:ss'})}`}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider text={'CRASH SUMMARY'} />
      <ListItem
        title={'Crashes'}
        value={'None'}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider text={'OPERATING COSTS'} />
      <ListItem
        title={'Model'}
        value={model.purchasePrice ? formatCurrency(model.purchasePrice) : 'Unknown'}
        position={['first']}
        rightImage={false}
      />
      <ListItem
        title={'Maintenance'}
        value={`$0.00`}
        rightImage={false}
      />
      <ListItem
        title={`Per ${eventKind(model.type).name}`}
        value={`$0.00`}
        position={['last']}
        rightImage={false}
      />
      <Divider type={'note'} text={'Costs are uncertain due to gaps in the underlying pricing or currency data.'} />
    </View>
  );
};

export default ModelStatisticsScreen;
