import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { HistoryEntry, useMaintenanceFilter } from 'lib/maintenance';
import {
  ListItem,
  SectionListHeader,
  listItemPosition,
  swipeableDeleteItem,
} from 'components/atoms/List';
import { ListRenderItem, SectionList, SectionListData } from 'react-native';
import React, { useEffect } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { ChecklistType } from 'types/checklist';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterType } from 'types/filter';
import { JChecklistActionHistoryEntry } from 'realmdb/Checklist';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { actionScheduleState } from 'lib/checklist';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useSelector } from 'react-redux';

type Section = {
  title?: string;
  data: JChecklistActionHistoryEntry[];
};

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'MaintenanceHistory'>;

const MaintenanceHistoryScree = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const filterId = useSelector(selectFilters(FilterType.MaintenanceFilter));
  const entries = useMaintenanceFilter({ modelId });
  const model = useObject(Model, new BSON.ObjectId(modelId));

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => {
        return (
          <>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!filterId && (!entries.length || listEditor.enabled)}
              icon={
                <CustomIcon
                  name={filterId ? 'filter-check' : 'filter'}
                  style={[
                    s.headerIcon,
                    !filterId && (!entries.length || listEditor.enabled)
                      ? s.headerIconDisabled
                      : {},
                  ]}
                />
              }
              onPress={() =>
                navigation.navigate('MaintenanceFiltersNavigator', {
                  screen: 'MaintenanceFilters',
                  params: {
                    filterType: FilterType.MaintenanceFilter,
                    useGeneralFilter: true,
                  },
                })
              }
            />
            <Button
              title={listEditor.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!entries.length}
              onPress={listEditor.onEdit}
            />
          </>
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterId, listEditor.enabled, entries]);

  const groupEntries = (entries?: HistoryEntry[]): SectionListData<HistoryEntry, Section>[] => {
    return groupItems<HistoryEntry, Section>(entries || [], entry => {
      return DateTime.fromISO(entry.history.date).toFormat('MMMM yyyy').toUpperCase();
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

  const renderActionHistoryEntry: ListRenderItem<HistoryEntry> = ({ item: entry, index }) => {
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
        onPress={() =>
          navigation.navigate('MaintenanceHistoryEntry', {
            modelId,
            checklistRefId: entry.checklist.refId,
            actionRefId: entry.action.refId,
            historyRefId: entry.history.refId,
          })
        }
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
          rightItems: [
            {
              ...swipeableDeleteItem[theme.mode],
              onPress: () =>
                confirmAction(deleteEntry, {
                  label: 'Delete Log Item',
                  title:
                    'This action cannot be undone.\nAre you sure you want to delete this maintenance log item?',
                  value: {
                    index,
                    entry,
                  },
                }),
            },
          ],
        }}
        onSwipeableWillOpen={() =>
          listEditor.onItemWillOpen('model-maintenance-history', entry.action.refId)
        }
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    );
  };

  if (filterId && !entries.length) {
    return <EmptyView message={`No Maintenance Logs Match Your Filter`} />;
  }

  if (!entries.length) {
    return <EmptyView info message={'No Maintenance Logs'} />;
  }

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={groupEntries(entries)}
      keyExtractor={(item, index) => `${index}${item.action.refId}`}
      renderItem={renderActionHistoryEntry}
      renderSectionHeader={({ section: { title } }) => <SectionListHeader title={title} />}
      ListFooterComponent={<Divider />}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
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

export default MaintenanceHistoryScree;
