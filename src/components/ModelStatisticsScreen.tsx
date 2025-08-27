import React from 'react';
import { ListRenderItem, ScrollView } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import {
  Divider,
  ListItem,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { EmptyView } from 'components/molecules/EmptyView';
import { secondsToFormat } from 'lib/formatters';
import { eventKind } from 'lib/modelEvent';
import { useCurrencyFormatter } from 'lib/useCurrencyFormatter';
import { BSON } from 'realm';
import { EventStyle } from 'realmdb/EventStyle';
import { Model, ModelEventStyleData } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ModelsNavigatorParamList,
  'ModelStatistics'
>;

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
      eventStyle = realm.objectForPrimaryKey(
        EventStyle,
        new BSON.ObjectId(data.eventStyleId),
      );
    }
    const average =
      data.eventStyleCount > 0
        ? data.eventStyleDuration / data.eventStyleCount
        : 0;
    const percentage = model?.statistics.totalTime
      ? (data.eventStyleDuration / model.statistics.totalTime) * 100
      : 0;
    return (
      <ListItem
        title={eventStyle?.name || 'Unspecified'}
        subtitle={`${data.eventStyleCount} ${data.eventStyleCount === 1 ? eventKind(model?.type).name.toLowerCase() : eventKind(model?.type).namePlural.toLowerCase()}, total ${secondsToFormat(data.eventStyleDuration, { format: "h'h' m'm'" })}`}
        value={`${Math.round(percentage)}%, ${secondsToFormat(average, { format: "m'm' s's'" })}`}
        position={listItemPosition(
          index,
          model?.statistics.eventStyleData.length || 0,
        )}
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
              text={`AVERAGE ${eventKind(model.type).name.toUpperCase()} DURATION BY STYLE`}
            />
          ) : null
        }
        ListFooterComponent={
          model.statistics.eventStyleData.length ? (
            <Divider
              note
              light
              subHeaderStyle={theme.text.medium}
              text={`Shows percentage of ${eventKind(model.type).namePlural.toLowerCase()} and average duration of logged ${eventKind(model.type).namePlural.toLowerCase()} for each style.`}
            />
          ) : (
            <Divider />
          )
        }
      />
      <ListItem
        title={'Total Time'}
        value={`${model.statistics.totalEvents} ${model.statistics.totalEvents === 1 ? eventKind(model.type).name.toLowerCase() : eventKind(model.type).namePlural.toLowerCase()}, ${secondsToFormat(model.statistics.totalTime, { format: "h'h' m'm'" })}`}
        position={['first', 'last']}
      />
      <Divider text={'CRASH SUMMARY'} />
      <ListItem
        title={'Crashes'}
        value={`${model.statistics.crashCount}`}
        position={['first', 'last']}
      />
      <Divider text={'OPERATING COSTS'} />
      <ListItem
        title={'Model'}
        value={
          model.purchasePrice ? formatCurrency(model.purchasePrice) : 'Unknown'
        }
        position={['first']}
      />
      <ListItem
        title={'Maintenance'}
        value={`${formatCurrency(model.statistics.totalMaintenanceCost)}`}
      />
      <ListItem
        title={`Per ${eventKind(model.type).name}`}
        value={`${formatCurrency(model.statistics.perEventCost)}`}
        position={['last']}
      />
      {(!model.purchasePrice || model.statistics.uncertainCost) && (
        <Divider
          note
          light
          subHeaderStyle={theme.text.medium}
          text={
            'Costs are uncertain due to gaps in the underlying pricing or cost data.'
          }
        />
      )}
    </ScrollView>
  );
};

export default ModelStatisticsScreen;
