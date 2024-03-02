import { AppTheme, useTheme } from 'theme';
import { Checklist, ChecklistAction, ChecklistActionHistoryEntry } from 'realmdb/Checklist';
import { ListItemCheckboxInfo, SectionListHeader, listItemPosition } from 'components/atoms/List';
import React, { useRef, useState } from 'react';
import { SectionList, SectionListData, SectionListRenderItem, View } from 'react-native';

import { BSON } from 'realm';
import { ChecklistType } from 'types/checklist';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { useObject } from '@realm/react';

type ChecklistActionItemData = {checklist: Checklist, action: ChecklistAction};
type Section = {
  title?: string;
  data: ChecklistActionItemData[];
};

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelMaintenance'>;

const ModelMaintenanceScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);

  const model = useObject(Model, new BSON.ObjectId(modelId));

  const checklists = useRef(model?.checklists.filter(c => {
    return c.type === ChecklistType.Maintenance;
  })).current;

  const actionsToDo = useRef(groupChecklistActions(checklists || []));

  // History captures the current date, the model time before the event, and the
  // event number at which the checklist action is performed.
  const [newChecklistActionHistoryEntry] = useState({
    date: DateTime.now().toISO()!,
    modelTime: model ? model.totalTime : 0,
    eventNumber: model ? model.totalEvents + 1 : 0,
  } as ChecklistActionHistoryEntry);

  function groupChecklistActions(checklists: Checklist[]): SectionListData<ChecklistActionItemData, Section>[] {
    let actionItemData: ChecklistActionItemData[] = [];
    let actions: ChecklistAction[] = [];

    checklists.forEach(c => {
      actions = c.actions.filter(a => a.schedule.state.due.now);
      actions.forEach(a => {
        actionItemData.push({
          checklist: c,
          action: a,
        });
      });  
    });

    return groupItems<ChecklistActionItemData, Section>(actionItemData, (actionItem) => {
      return actionItem.checklist.name.toUpperCase();
    });
  };

  const renderChecklistAction: SectionListRenderItem<ChecklistActionItemData, Section> = ({
    item: actionItem,
    section,
    index,
  }: {
    item: ChecklistActionItemData;
    section: Section;
    index: number;
  }) => {
    return (
      <ListItemCheckboxInfo
        key={index}
        title={actionItem.action.description}
        subtitle={actionItem.action.schedule.state.text}
        iconChecked={'square-check'}
        iconUnchecked={'square'}
        iconSize={26}
        iconColor={theme.colors.screenHeaderButtonText}
        checked={false}
        position={listItemPosition(index, section.data.length)}
        onPress={() => {return null}}
        onPressInfo={() => navigation.navigate('ModelMaintenanceItem', {
          modelId,
          checklistRefId: actionItem.checklist.refId,
          actionRefId: actionItem.action.refId,
        })}
       /> 
    );
  };

  return (
    <View style={theme.styles.view}>
      <SectionList
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        style={[theme.styles.view, s.sectionList]}
        sections={actionsToDo.current}
        keyExtractor={(item, index)=> `${index}${item.action.refId}`}
        renderItem={renderChecklistAction}
        renderSectionHeader={({section: {title}}) => (
          <SectionListHeader title={title} />
        )}
        ListFooterComponent={<Divider />}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ModelMaintenanceScreen;
