import React, { useEffect, useRef, useState } from 'react';
import {
  ListRenderItem,
  SectionList,
  SectionListData,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItemSwipeable,
  ThemeManager,
  listItemPosition,
  // useListEditor,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { HeaderIconButton, headerOptions } from 'components/atoms/navigation';
import { EmptyView } from 'components/molecules/EmptyView';
import { actionScheduleState } from 'lib/checklist';
import { HistoryEntry, useMaintenanceFilter } from 'lib/maintenance';
import { groupItems } from 'lib/sectionList';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Funnel, FunnelPlus, Trash2 } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { JChecklistActionHistoryEntry } from 'realmdb/Checklist';
import { Model } from 'realmdb/Model';
import { selectFilters } from 'store/selectors/filterSelectors';
import { ChecklistType } from 'types/checklist';
import { FilterType } from 'types/filter';
import { ModelsNavigatorParamList } from 'types/navigation';

type Section = {
  title?: string;
  data: JChecklistActionHistoryEntry[];
};

export type Props = NativeStackScreenProps<
  ModelsNavigatorParamList,
  'MaintenanceHistory'
>;

const MaintenanceHistoryScree = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const s = useStyles();
  // const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const filterId = useSelector(selectFilters(FilterType.MaintenanceFilter));
  const entries = useMaintenanceFilter({ modelId });
  const model = useObject(Model, new BSON.ObjectId(modelId));

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions(
      headerOptions({
        right: [
          <HeaderIconButton
            disabled={!entries.length || listEditorState?.enabled}
            Icon={filterId ? FunnelPlus : Funnel}
            onPress={() =>
              navigation.navigate('MaintenanceFiltersNavigator', {
                screen: 'MaintenanceFilters',
                params: {
                  filterType: FilterType.MaintenanceFilter,
                  useGeneralFilter: true,
                },
              })
            }
          />,
          <Button
            title={listEditorState?.enabled ? 'Done' : 'Edit'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            disabled={!entries.length}
            onPress={() => listEditorRef.current?.onToggleEditMode()}
          />,
        ],
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterId, listEditorState?.enabled, entries]);

  const groupEntries = (
    entries?: HistoryEntry[],
  ): SectionListData<HistoryEntry, Section>[] => {
    return groupItems<HistoryEntry, Section>(entries || [], entry => {
      return DateTime.fromISO(entry.history.date)
        .toFormat('MMMM yyyy')
        .toUpperCase();
    });
  };

  const deleteEntry = (data: { index: number; entry: HistoryEntry }) => {
    realm.write(() => {
      // Find the history entry in the action history using the refId.
      const historyIndex = data.entry.action.history.findIndex(
        h => h.refId === data.entry.history.refId,
      );
      if (historyIndex >= 0) {
        // Delete the history entry from the action and delete it from our section list data (don't hold on to the deleted object).
        data.entry.action.history.splice(historyIndex, 1);
        entries.splice(data.index, 1);

        // Update the schedule state for the affected action - deletion may trigger the
        // action to be due.
        data.entry.action.schedule.state = actionScheduleState(
          data.entry.action,
          ChecklistType.Maintenance,
          model || undefined,
        );
      }
    });
  };

  const renderActionHistoryEntry: ListRenderItem<HistoryEntry> = ({
    item: entry,
    index,
  }) => {
    let subtitle = DateTime.fromISO(entry.history.date).toFormat(
      'M/d/yyyy h:mm a',
    );
    if (entry.action.notes) {
      subtitle = `${subtitle}\n\n${entry.action.notes}`;
    }
    return (
      <ListItemSwipeable
        // ref={ref => {
        //   if (ref)
        //     listEditor.add(
        //       ref,
        //       'model-maintenance-history',
        //       entry.action.refId,
        //     );
        // }}
        key={`${index}${entry.action.refId}`}
        title={entry.action.description}
        subtitle={subtitle}
        position={listItemPosition(index, entries.length)}
        onPress={() =>
          navigation.navigate('MaintenanceHistoryEntry', {
            modelId,
            checklistRefId: entry.checklist.refId,
            actionRefId: entry.action.refId,
            historyRefId: entry.history.refId,
          })
        }
        rightContent={'chevron-right'}
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
        }}
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: 'Delete Log Item',
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this maintenance log item?',
              });
            },
            onPress: () => deleteEntry({ index, entry }),
          },
        ]}
        // onSwipeableWillOpen={() =>
        //   listEditor.onItemWillOpen(
        //     'model-maintenance-history',
        //     entry.action.refId,
        //   )
        // }
      />
    );
  };

  if (filterId && !entries.length) {
    return (
      <EmptyView
        message={`No Maintenance Logs Match Your Filter`}
        details={'Adjust your filter settings to see maintenance logs.'}
        buttonTitle={'Adjust Filter'}
        onButtonPress={() =>
          navigation.navigate('MaintenanceFiltersNavigator', {
            screen: 'MaintenanceFilters',
            params: {
              filterType: FilterType.MaintenanceFilter,
              useGeneralFilter: true,
            },
          })
        }
      />
    );
  }

  if (!entries.length) {
    return <EmptyView info message={'No Maintenance Logs'} />;
  }

  return (
    <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
      <SectionList
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        style={[theme.styles.view, s.sectionList]}
        sections={groupEntries(entries)}
        keyExtractor={(item, index) => `${index}${item.action.refId}`}
        renderItem={renderActionHistoryEntry}
        renderSectionHeader={({ section: { title } }) => (
          <View style={theme.styles.listSectionHeader}>
            <Divider text={title} />
          </View>
        )}
        ListFooterComponent={<Divider />}
      />
    </ListEditor>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default MaintenanceHistoryScree;
