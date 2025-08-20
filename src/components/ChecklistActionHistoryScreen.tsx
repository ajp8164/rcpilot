import React from 'react';
import { ListRenderItem, SectionList, SectionListData } from 'react-native';

import {
  Divider,
  ListItem,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject } from '@realm/react';
import { EmptyView } from 'components/molecules/EmptyView';
import { secondsToFormat } from 'lib/formatters';
import { eventKind } from 'lib/modelEvent';
import { groupItems } from 'lib/sectionList';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { JChecklistActionHistoryEntry } from 'realmdb/Checklist';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';

type Section = {
  title?: string;
  data: JChecklistActionHistoryEntry[];
};

export type Props = NativeStackScreenProps<
  ModelsNavigatorParamList,
  'ChecklistActionHistory'
>;

const ChecklistActionHistoryScreen = ({ route }: Props) => {
  const { action, modelId } = route.params;

  const theme = useTheme();
  const s = useStyles();

  const model = useObject(Model, new BSON.ObjectId(modelId));

  const groupEntries = (
    entries?: JChecklistActionHistoryEntry[],
  ): SectionListData<JChecklistActionHistoryEntry, Section>[] => {
    return groupItems<JChecklistActionHistoryEntry, Section>(
      entries || [],
      entry => {
        return DateTime.fromISO(entry.date).toFormat('MMMM yyyy').toUpperCase();
      },
    );
  };

  const renderActionHistoryEntry: ListRenderItem<
    JChecklistActionHistoryEntry
  > = ({ item: historyEntry, index }) => {
    return (
      <ListItem
        key={`${index}`}
        title={`${eventKind(model?.type).name} #${historyEntry.eventNumber}`}
        subtitle={`${DateTime.fromISO(historyEntry.date).toFormat('M/d/yyyy h:mm a')}\nModel Time ${secondsToFormat(historyEntry.modelTime, { format: "h'h' m'm'" })}`}
        position={listItemPosition(index, action.history.length)}
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
        ([] as JChecklistActionHistoryEntry[])
          .concat([], action.history)
          .reverse(),
      )}
      keyExtractor={(item, index) => `${index}${item.eventNumber}`}
      renderItem={renderActionHistoryEntry}
      renderSectionHeader={({ section: { title } }) => <Divider text={title} />}
      ListFooterComponent={<Divider />}
    />
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ChecklistActionHistoryScreen;
