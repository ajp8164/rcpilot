import { ListItem, listItemPosition } from 'components/atoms/List';
import { ListRenderItem, ScrollView } from 'react-native';
import { Model, ModelEventStyleData } from 'realmdb/Model';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { EventStyle } from 'realmdb/EventStyle';
import { FlatList } from 'react-native-gesture-handler';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { eventKind } from 'lib/modelEvent';
import { secondsToMSS } from 'lib/formatters';
import { useCurrencyFormatter } from 'lib/useCurrencyFormatter';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelStatistics'>;

const ModelStatisticsScreen = ({ route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const realm = useRealm();

  const formatCurrency = useCurrencyFormatter();

  const model = useObject(Model, new BSON.ObjectId(modelId));

  const renderEventDurationAverage: ListRenderItem<ModelEventStyleData> = ({
    item: data,
    index,
  }) => {
    let eventStyle;
    if (data.eventStyleId.length) {
      eventStyle = realm.objectForPrimaryKey(EventStyle, new BSON.ObjectId(data.eventStyleId));
    }
    const average = data.eventStyleCount > 0 ? data.eventStyleDuration / data.eventStyleCount : 0;
    const percentage =
      model && model.statistics.totalTime
        ? (data.eventStyleDuration / model.statistics.totalTime) * 100
        : 0;
    return (
      <ListItem
        title={eventStyle?.name || 'Unspecified'}
        subtitle={`${data.eventStyleCount} ${eventKind(model?.type).namePlural.toLowerCase()}, total ${secondsToMSS(data.eventStyleDuration, { format: 'm:ss' })}`}
        value={`${Math.round(percentage)}%, ${secondsToMSS(average, { format: 'm:ss' })}`}
        position={listItemPosition(index, model?.statistics.eventStyleData.length || 0)}
        rightImage={false}
      />
    );
  };

  if (!model) {
    return <EmptyView error message={'Model Not Found!'} />;
  }

  return (
    <ScrollView style={theme.styles.view}>
      <FlatList
        data={model.statistics.eventStyleData}
        renderItem={renderEventDurationAverage}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListHeaderComponent={
          model.statistics.eventStyleData.length ? (
            <Divider
              text={`${eventKind(model.type).name.toUpperCase()} DURATION AVERAGE BY STYLE`}
            />
          ) : null
        }
        ListFooterComponent={
          model.statistics.eventStyleData.length ? (
            <Divider
              note
              text={`Shows percentage of ${eventKind(model.type).namePlural.toLowerCase()} and average duration (M:SS) of logged ${eventKind(model.type).namePlural.toLowerCase()} for each style.`}
            />
          ) : (
            <Divider />
          )
        }
      />
      <ListItem
        title={'Total Time'}
        value={`${model.statistics.totalEvents} ${eventKind(model.type).namePlural.toLowerCase()}, ${secondsToMSS(model.statistics.totalTime, { format: 'm:ss' })}`}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider text={'CRASH SUMMARY'} />
      <ListItem
        title={'Crashes'}
        value={`${model.statistics.crashCount}`}
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
        value={`${formatCurrency(model.statistics.totalMaintenanceCost)}`}
        rightImage={false}
      />
      <ListItem
        title={`Per ${eventKind(model.type).name}`}
        value={`${formatCurrency(model.statistics.perEventCost)}`}
        position={['last']}
        rightImage={false}
      />
      {(!model.purchasePrice || model.statistics.uncertainCost) && (
        <Divider
          note
          text={'Costs are uncertain due to gaps in the underlying pricing or cost data.'}
        />
      )}
    </ScrollView>
  );
};

export default ModelStatisticsScreen;
