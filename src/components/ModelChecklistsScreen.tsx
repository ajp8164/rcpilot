import { ActionSheetConfirm, ActionSheetConfirmMethods } from 'components/molecules/ActionSheetConfirm';
import { AppTheme, useTheme } from 'theme';
import { Checklist, JChecklistAction } from 'realmdb/Checklist';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem, ScrollView } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useRef, useState } from 'react';
import { useObject, useQuery, useRealm } from '@realm/react';

import { ActionSheet } from 'react-native-ui-lib';
import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { ChecklistTemplate } from 'realmdb/ChecklistTemplate';
import { ChecklistTemplatePickerResult } from 'components/ChecklistTemplatePickerScreen';
import { ChecklistType } from 'types/checklist';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { uuidv4 } from 'lib/utils';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelChecklists'>;

const ModelChecklistsScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const event = useEvent();
  const realm = useRealm();

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const allChecklistTemplates = useQuery(ChecklistTemplate);

  const [allModelChecklists, setAllModelChecklists] = useState<{[key in ChecklistType]: Checklist[]}>({
    [ChecklistType.PreEvent]: [],
    [ChecklistType.PostEvent]: [],
    [ChecklistType.Maintenance]: [],
  });

  const [newChecklistActionSheetVisible, setNewChecklistActionSheetVisible] = useState(false);
  const actionSheetConfirm = useRef<ActionSheetConfirmMethods>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            icon={<Icon name={'plus'} style={s.headerIcon}/>}
            onPress={addChecklist}
          />
        )
      },
    });
  }, []);

  useEffect(() => {
    if (!model) return;

    // Can't update checklists in this hook on model data changes (using hook deps)
    // since the hook will run after the render cycle caused by the model data changes
    // via the realm update. Instead, initialize here and update local state during
    // adds and deletes.
    updateChecklists(model);
  }, []);

  const updateChecklists = (model: Model) => {
    if (!model) return;

    const pre = model.checklists.filter(t => t.type === ChecklistType.PreEvent);
    const post = model.checklists.filter(t => t.type === ChecklistType.PostEvent);
    const maint = model.checklists.filter(t => t.type === ChecklistType.Maintenance);
    setAllModelChecklists({
      [ChecklistType.PreEvent]: pre,
      [ChecklistType.PostEvent]: post,
      [ChecklistType.Maintenance]: maint,
    });
  };

  useEffect(() => {
    event.on('model-checklist', onChooseChecklistTemplate);
    return () => {
      event.removeListener('model-checklist', onChooseChecklistTemplate);
    };
  }, []);

  const onChooseChecklistTemplate = (result: ChecklistTemplatePickerResult) => {
    const checklistTemplate = realm.objectForPrimaryKey<ChecklistTemplate>('ChecklistTemplate', new BSON.ObjectId(result.checklistTemplateId));

    // Copy the template into a checklist instance and add it to the model.
    if (checklistTemplate) {
      realm.write(() => {
        const newChecklist = {
          refId: uuidv4(),
          name: checklistTemplate.name,
          type: checklistTemplate.type,
          actions: checklistTemplate.actions.toJSON() as JChecklistAction[],
        } as Checklist;

        if (newChecklist) {
          model!.checklists.push(newChecklist);
        }
      });
      updateChecklists(model!);
    }
    navigation.goBack();
  };

  const addChecklist = () => {
    if (allChecklistTemplates.length) {
      setNewChecklistActionSheetVisible(true);
    } else {
      // navigation.navigate('NewChecklist', {
      //   modelId,
      // });
    }
  };

  const deleteChecklist = (checklist: Checklist) => {
    realm.write(() => {
      const index = model?.checklists.findIndex(cl => cl.refId === checklist.refId);
      if (index !== undefined) {
        model?.checklists.splice(index, 1);
      }
    });
    updateChecklists(model!);
  };

  const renderChecklist = (checklist: Checklist, index: number, arrLength: number) => {
    return (
      <ListItem
        ref={ref => listEditor.add(ref, 'checklists', index)}
        key={checklist.refId}
        title={checklist.name}
        subtitle={`Contains ${checklist.actions.length} actions`}
        position={listItemPosition(index, arrLength)}
        // onPress={() => navigation.navigate('ChecklistEditor', {
        //   checklistTemplateId: item._id.toString(),
        // })}
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
            icon: 'trash',
            iconType: 'font-awesome',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => actionSheetConfirm.current?.confirm(checklist),
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('checklists', index)}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  const renderPreEventChecklist: ListRenderItem<Checklist> = ({
    item: checklist,
    index
  }) => {
    return renderChecklist(
      checklist,
      index,
      allModelChecklists[ChecklistType.PreEvent].length
    );
  };

  const renderPostEventChecklist: ListRenderItem<Checklist> = ({
    item: checklist,
    index
  }) => {
    return renderChecklist(
      checklist,
      index,
      allModelChecklists[ChecklistType.PostEvent].length
    );
  };

  const renderMaintenanceChecklist: ListRenderItem<Checklist> = ({
    item: checklist,
    index
  }) => {
    return renderChecklist(
      checklist,
      index,
      allModelChecklists[ChecklistType.Maintenance].length
    );
  };

  const renderNewChecklistActionSheet = () => {
    return (
      <ActionSheet
        cancelButtonIndex={2}
        options={[
          {
            label: 'Add New',
            onPress: () => {
              setNewChecklistActionSheetVisible(false);
            }
          },
          {
            label: 'Add From Template',
            onPress: () => {
              navigation.navigate('ChecklistTemplatePicker', {
                eventName: 'model-checklist',
              });
              setNewChecklistActionSheetVisible(false);
            }
          },
          {
            label: 'Cancel',
            onPress: () => setNewChecklistActionSheetVisible(false),
          },
        ]}
        useNativeIOS={true}
        visible={newChecklistActionSheetVisible}
      />
    );    
  };

  if (!model?.checklists.length) {
    return (
      <>
        <EmptyView info message={'No Checklists'} details={"Tap the + button to add your first checklist."} />
        {renderNewChecklistActionSheet()}
      </>
    );
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <FlatList
        data={allModelChecklists[ChecklistType.PreEvent]}
        renderItem={renderPreEventChecklist}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListHeaderComponent={
          allModelChecklists[ChecklistType.PreEvent].length > 0
            ? <Divider text={'PRE-FLIGHT'}/>
            : <></>            
        }
      />
      <FlatList
        data={allModelChecklists[ChecklistType.PostEvent]}
        renderItem={renderPostEventChecklist}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListHeaderComponent={
          allModelChecklists[ChecklistType.PostEvent].length > 0
            ? <Divider text={'POST-FLIGHT'}/>
            : <></>            
        }
      />
      <FlatList
        data={allModelChecklists[ChecklistType.Maintenance]}
        renderItem={renderMaintenanceChecklist}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListHeaderComponent={
          allModelChecklists[ChecklistType.Maintenance].length > 0
            ? <Divider text={'MAINTENANCE'}/>
            : <></>            
        }
      />
      <Divider />
      {renderNewChecklistActionSheet()}
      <ActionSheetConfirm
        ref={actionSheetConfirm}
        label={'Delete Checklist'}
        onConfirm={deleteChecklist}
      />
    </ScrollView>
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
  },
}));

export default ModelChecklistsScreen;
