import { AppTheme, useTheme } from 'theme';
import { Checklist, JChecklistAction } from 'realmdb/Checklist';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem, ScrollView } from 'react-native';
import { ListItem, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { useObject, useQuery, useRealm } from '@realm/react';

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
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useEvent } from 'lib/event';
import { uuidv4 } from 'lib/utils';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelChecklists'>;

const ModelChecklistsScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const { showActionSheetWithOptions } = useActionSheet();
  const confirmDeleteChecklist = useConfirmAction();
  const event = useEvent();
  const realm = useRealm();

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const allChecklistTemplates = useQuery(ChecklistTemplate);

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

  const preEventModelChecklists = () => {
    return model?.checklists.filter(t => t.type === ChecklistType.PreEvent) || [];
  };

  const postEventModelChecklists = () => {
    return model?.checklists.filter(t => t.type === ChecklistType.PostEvent) || [];
  };

  const maintenanceModelChecklists = () => {
    return model?.checklists.filter(t => t.type === ChecklistType.Maintenance) || [];
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
    }
    navigation.goBack();
  };

  const addChecklist = () => {
    showActionSheetWithOptions(
      {
        options: ['Add New', 'Add From Template', 'Cancel'],
        disabledButtonIndices: allChecklistTemplates.length ? [] : [1],
        message: allChecklistTemplates.length ? '' : 'No checklist templates. Create your first checklist template on the Setup tab.',
        cancelButtonIndex: 2,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            navigation.navigate('NewChecklistNavigator', {
              screen: 'NewChecklist',
              params: {
                modelId,
              },
            });
            break;
          case 1:
            navigation.navigate('ChecklistTemplatePicker', {
              eventName: 'model-checklist',
            });
            break;
          default:
            break;
        }
      },
    );
  };

  const deleteChecklist = (checklist: Checklist) => {
    realm.write(() => {
      const index = model?.checklists.findIndex(cl => cl.refId === checklist.refId);
      if (index !== undefined) {
        model?.checklists.splice(index, 1);
      }
    });
  };

  const renderChecklist = (checklist: Checklist, index: number, arrLength: number) => {
    return (
      <ListItem
        ref={ref => ref && listEditor.add(ref, 'checklists', checklist.refId)}
        key={checklist.refId}
        title={checklist.name}
        subtitle={`Contains ${checklist.actions.length} actions`}
        position={listItemPosition(index, arrLength)}
        onPress={() => navigation.navigate('ChecklistEditor', {
          modelId,
          modelChecklistRefId: checklist.refId,
        })}
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
            onPress: () => confirmDeleteChecklist('Delete Checklist', checklist, deleteChecklist),
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('checklists', checklist.refId)}
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
      preEventModelChecklists().length,
    );
  };

  const renderPostEventChecklist: ListRenderItem<Checklist> = ({
    item: checklist,
    index
  }) => {
    return renderChecklist(
      checklist,
      index,
      postEventModelChecklists().length,
    );
  };

  const renderMaintenanceChecklist: ListRenderItem<Checklist> = ({
    item: checklist,
    index
  }) => {
    return renderChecklist(
      checklist,
      index,
      maintenanceModelChecklists().length,
    );
  };

  if (!model?.checklists.length) {
    return (
      <>
        <EmptyView info message={'No Checklists'} details={"Tap the + button to add your first checklist."} />
      </>
    );
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <FlatList
        data={preEventModelChecklists()}
        renderItem={renderPreEventChecklist}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListHeaderComponent={
          preEventModelChecklists().length > 0
            ? <Divider text={'PRE-FLIGHT'}/>
            : <></>            
        }
      />
      <FlatList
        data={postEventModelChecklists()}
        renderItem={renderPostEventChecklist}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListHeaderComponent={
          postEventModelChecklists().length > 0
            ? <Divider text={'POST-FLIGHT'}/>
            : <></>            
        }
      />
      <FlatList
        data={maintenanceModelChecklists()}
        renderItem={renderMaintenanceChecklist}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListHeaderComponent={
          maintenanceModelChecklists().length > 0
            ? <Divider text={'MAINTENANCE'}/>
            : <></>            
        }
      />
      <Divider />
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