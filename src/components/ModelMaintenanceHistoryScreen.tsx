import { AppTheme, useTheme } from 'theme';
import { ChecklistAction, ChecklistActionHistoryEntry, JChecklistActionHistoryEntry } from 'realmdb/Checklist';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { ListItem, SectionListHeader, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import { ListRenderItem, SectionList, SectionListData } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { ChecklistType } from 'types/checklist';
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { actionScheduleState } from 'lib/checklist';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { useConfirmAction } from 'lib/useConfirmAction';

type Section = {
  title?: string;
  data: JChecklistActionHistoryEntry[];
};

type HistoryEntry = {
  action: ChecklistAction,
  history: ChecklistActionHistoryEntry,
};

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelMaintenanceHistory'>;

const ModelMaintenanceHistoryScree = ({ navigation, route }: Props) => {
  const {
    modelId,
  } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const loading = useRef(true);

  useEffect(() => {  
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <>
            <Button
              buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={listEditor.enabled || !entries.length}
              icon={
                <Icon
                  name={'filter'}
                  style={[s.headerIcon, listEditor.enabled || !entries.length ? s.headerIconDisabled : {}]}
                />
              }
              // onPress={() => navigation.navigate('ModelMaintenanceHistoryFiltersNavigator', {
              //   screen: 'ModelMaintenanceFilters',
              // })}
            />
            <Button
              title={listEditor.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!entries.length}
              onPress={listEditor.onEdit}
            />
          </>
        );
      },
    });
  }, [ listEditor.enabled, entries ]);

  useEffect(() => {
    // Create the section list data set.
    let e: HistoryEntry[] = [];
    const maintenanceChecklists = model?.checklists.filter(c =>
      c.type === ChecklistType.Maintenance || c.type === ChecklistType.OneTimeMaintenance
    );
    maintenanceChecklists?.forEach(c => {
      c.actions.forEach(a => {
        a.history.forEach(h => {
          e.push({
            action: a,
            history: h,  
          } as HistoryEntry);
        });
      });
    });

    setEntries(e.sort((a, b) => {
      return (a.history.date > b.history.date) ? -1 : ((a.history.date < b.history.date) ? 1 : 0)
    }));
    
    loading.current = false;
  }, []);

  const groupEntries = (entries?: HistoryEntry[]): SectionListData<HistoryEntry, Section>[] => {
    return groupItems<HistoryEntry, Section>(entries || [], (entry) => {
      return DateTime.fromISO(entry.history.date).toFormat('MMMM yyyy').toUpperCase();
    });
  };

  const deleteEntry = (data: {index: number, entry: HistoryEntry}) => {
    realm.write(() => {
      // Find the history entry in the action history using the refId.
      const historyIndex = data.entry.action.history.findIndex(h => h.refId === data.entry.history.refId);
      if (historyIndex >= 0) {
        // Delete the history entry from the action and delete it from our section list data (don't hold on to the deleted object).
        data.entry.action.history.splice(historyIndex, 1);
        entries.splice(data.index, 1);

        // Update the schedule state for the affected action - deletion may trigger the
        // action to be due.
        data.entry.action.schedule.state = actionScheduleState(
          data.entry.action,
          ChecklistType.Maintenance,
          model!
        );
      }
    });
  };

  const renderActionHistoryEntry: ListRenderItem<HistoryEntry> = ({
    item: entry,
    index
  }) => {
    let subtitle = DateTime.fromISO(entry.history.date).toFormat('M/d/yyyy h:mm a');
    if (entry.action.notes) {
      subtitle = `${subtitle}\n\n${entry.action.notes}`;
    }
    return (
      <ListItem
        ref={ref => ref && listEditor.add(ref, 'model-maintenance-history', entry.action.refId)}
        key={`${index}`}
        title={entry.action.description}
        subtitle={subtitle}
        titleNumberOfLines={1}
        position={listItemPosition(index, entries.length)}
        onPress={() => {return}}
        editable={{
          item: {
            icon: 'remove-circle',
            color: theme.colors.assertive,
            action: 'open-swipeable',
          },
          reorder: true,
        }}
        showEditor={listEditor.show}
        swipeable={{
          rightItems: [{
            ...swipeableDeleteItem[theme.mode],
            onPress: () => confirmAction(deleteEntry, {
              label: 'Delete Log Item',
              title: 'This action cannot be undone.\nAre you sure you want to delete this maintenance log item?',
              value: {
                index,
                entry,
              }
            })
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('model-maintenance-history', entry.action.refId)}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  if (loading.current) {
    return (
      <EmptyView isLoading message={'Loading Maintenance Log'} />
    );
  };
  
  if (!entries.length) {
    return (
      <EmptyView info message={'No Maintenance History'} />
    );
  }

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={groupEntries(entries)}
      keyExtractor={(item, index)=> `${index}${item.action.refId}`}
      renderItem={renderActionHistoryEntry}
      renderSectionHeader={({section: {title}}) => (
        <SectionListHeader title={title} />
      )}
      ListFooterComponent={<Divider />}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
    marginHorizontal: 10,
  },
  headerIconDisabled: {
    color: theme.colors.disabled,
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ModelMaintenanceHistoryScree;
