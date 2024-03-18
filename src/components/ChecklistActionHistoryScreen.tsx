import { AppTheme, useTheme } from 'theme';
import { ListItem, SectionListHeader, listItemPosition } from 'components/atoms/List';
import { ListRenderItem, SectionList, SectionListData } from 'react-native';

import { BSON } from 'realm';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { JChecklistActionHistoryEntry } from 'realmdb/Checklist';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { eventKind } from 'lib/modelEvent';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { secondsToMSS } from 'lib/formatters';
import { useObject } from '@realm/react';

type Section = {
  title?: string;
  data: JChecklistActionHistoryEntry[];
};

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ChecklistActionHistory'>;

const ChecklistActionHistoryScreen = ({ route }: Props) => {
  const { action, modelId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);

  const model = useObject(Model, new BSON.ObjectId(modelId));

  const groupEntries = (
    entries?: JChecklistActionHistoryEntry[],
  ): SectionListData<JChecklistActionHistoryEntry, Section>[] => {
    return groupItems<JChecklistActionHistoryEntry, Section>(entries || [], entry => {
      return DateTime.fromISO(entry.date).toFormat('MMMM yyyy').toUpperCase();
    });
  };

  const renderActionHistoryEntry: ListRenderItem<JChecklistActionHistoryEntry> = ({
    item: historyEntry,
    index,
  }) => {
    return (
      <ListItem
        key={`${index}`}
        title={`${eventKind(model?.type).name} #${historyEntry.eventNumber}`}
        subtitle={`${DateTime.fromISO(historyEntry.date).toFormat('M/d/yyyy h:mm a')}\nModel Time ${secondsToMSS(historyEntry.modelTime, { format: 'm:ss' })}`}
        position={listItemPosition(index, action.history.length)}
        rightImage={false}
      />
    );
  };

  if (!action.history.length) {
    return (
      <EmptyView
        info
        message={'No Checklist Actions Logged'}
        details={`This action has not yet been performed on ${model?.type.toLowerCase()} ${model?.name}.`}
      />
    );
  }

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={groupEntries(
        ([] as JChecklistActionHistoryEntry[]).concat([], action.history).reverse(),
      )}
      keyExtractor={(item, index) => `${index}${item.eventNumber}`}
      renderItem={renderActionHistoryEntry}
      renderSectionHeader={({ section: { title } }) => <SectionListHeader title={title} />}
      ListFooterComponent={<Divider />}
    />
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ChecklistActionHistoryScreen;
