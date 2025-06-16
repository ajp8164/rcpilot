import { AppTheme, useTheme } from 'theme';
import { Checklist, ChecklistAction, JChecklistAction } from 'realmdb/Checklist';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import {
  ListItem,
  ListItemInput,
  listItemPosition,
  swipeableDeleteItem,
} from 'components/atoms/List';
import {
  ModelsNavigatorParamList,
  NewChecklistNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Platform, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rn-vui/base';
import { ChecklistTemplate } from 'realmdb/ChecklistTemplate';
import { ChecklistType } from 'types/checklist';
import { CompositeScreenProps } from '@react-navigation/core';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { Model } from 'realmdb/Model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { eqString } from 'realmdb/helpers';
import { makeStyles } from '@rn-vui/themed';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useEvent } from 'lib/event';
import { uuidv4 } from 'lib/utils';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistEditor'>,
  CompositeScreenProps<
    NativeStackScreenProps<ModelsNavigatorParamList, 'ChecklistEditor'>,
    NativeStackScreenProps<NewChecklistNavigatorParamList, 'NewChecklist'>
  >
>;

const ChecklistEditorScreen = ({ navigation, route }: Props) => {
  const { checklistTemplateId, modelId, modelChecklistRefId } = route.params || {};

  const theme = useTheme();
  const s = useStyles(theme);
  const setDebounced = useDebouncedRender();
  const listEditor = useListEditor();
  const event = useEvent();
  const realm = useRealm();

  // This editor provides capability for checklist templates and model checklists. We use a
  // 'working' reference to the correct object throughout the editor.
  const checklistTemplate = useObject(ChecklistTemplate, new BSON.ObjectId(checklistTemplateId));

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const modelChecklist = model?.checklists.find(c => c.refId === modelChecklistRefId);

  const workingChecklist = checklistTemplate || modelChecklist || undefined;
  const editingTemplate = useRef(!modelId).current; // This is a template editor if no modelId.
  const eventNameId = useRef(uuidv4()).current; // Used for unique action change event name.

  const name = useRef(checklistTemplate?.name || modelChecklist?.name || undefined);
  const [type, setType] = useState(
    checklistTemplate?.type || modelChecklist?.type || ChecklistType.PreEvent,
  );
  const [actions, setActions] = useState<JChecklistAction[]>(
    checklistTemplate?.actions.toJSON() ||
      (modelChecklist !== undefined ? JSON.parse(JSON.stringify(modelChecklist.actions)) : []),
  ); // Need to convert the model checklist actions into a plain object to decouple from the realm array instance.

  useEffect(() => {
    const canSave =
      !!name.current &&
      (!eqString(workingChecklist?.name, name.current) || !eqString(workingChecklist?.type, type));

    const save = () => {
      if (editingTemplate) {
        // Not a model checklist, handle saving a checklist template.
        if (checklistTemplate) {
          realm.write(() => {
            checklistTemplate.name = name.current || 'no-name';
            checklistTemplate.type = type;
            // Existing actions are saved inline with edits/adds.
          });
        } else {
          realm.write(() => {
            realm.create('ChecklistTemplate', {
              name: name.current,
              type,
              actions,
            });
          });
        }
      } else {
        // Is a model checklist, handle updating the checklist on the model.
        if (model && modelChecklist) {
          // Update an existing model checklist.
          realm.write(() => {
            const index = model?.checklists.findIndex(c => c.refId === modelChecklistRefId);
            model.checklists[index].name = name.current || 'no-name';
            model.checklists[index].type = type;
            // Existing actions are saved inline with edits/adds.
          });
        } else {
          // Create a new checklist on the model.
          realm.write(() => {
            const newModelChecklist = {
              refId: uuidv4(),
              name: name.current,
              type,
              actions,
            } as Checklist;

            model?.checklists.push(newModelChecklist);
          });
        }
      }
    };

    const onDone = () => {
      save();
      navigation.goBack();
    };

    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft: () => {
        if (!checklistTemplateId && !modelChecklistRefId) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={navigation.goBack}
            />
          );
        }
      },
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => {
        if (canSave) {
          return (
            <Button
              title={'Save'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={onDone}
            />
          );
        } else {
          if (actions.length > 0) {
            return (
              <Button
                title={listEditor.enabled ? 'Done' : 'Edit'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.buttonScreenHeader}
                onPress={listEditor.onEdit}
              />
            );
          }
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name.current, type, actions, listEditor.enabled]);

  useEffect(() => {
    event.on(`checklist-type-${eventNameId}`, onChangeType);
    event.on(`checklist-action-${eventNameId}`, upsertAction);
    return () => {
      event.removeListener(`checklist-type-${eventNameId}`, onChangeType);
      event.removeListener(`checklist-action-${eventNameId}`, upsertAction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingTemplate) {
      if (checklistTemplate) {
        realm.write(() => {
          // @ts-expect-error: not recognizing the target as a (realm) embedded array
          checklistTemplate.actions = actions;
        });
      }
    } else {
      if (model && modelChecklist) {
        // Update an existing model checklist.
        realm.write(() => {
          const index = model.checklists.findIndex(c => c.refId === modelChecklistRefId);
          model.checklists[index].actions = actions as ChecklistAction[];
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  const onChangeType = (result: EnumPickerResult) => {
    setType(result.value[0] as ChecklistType);
  };

  const upsertAction = (newOrChangedAction: JChecklistAction) => {
    if (newOrChangedAction.refId !== undefined) {
      // Update existing action.
      setActions(prevState => {
        const actns = [...prevState];
        const index = actns.findIndex(a => a.refId === newOrChangedAction.refId);
        actns[index] = newOrChangedAction;
        return actns;
      });
    } else {
      // Insert a new action.
      newOrChangedAction.refId = uuidv4();
      setActions(prevState => {
        return [...prevState].concat(newOrChangedAction);
      });
    }
  };

  const deleteAction = (index: number) => {
    if ((editingTemplate && checklistTemplate) || modelChecklist) {
      const a = [...actions];
      a.splice(index, 1);
      setActions(a);
    }
  };

  const reorderActions = (data: JChecklistAction[]) => {
    setActions(data);
  };

  const renderChecklistAction = ({
    item: action,
    getIndex,
    drag,
    isActive,
  }: RenderItemParams<JChecklistAction>) => {
    const index = getIndex();
    if (index === undefined) return null;
    return (
      <View key={index} style={[isActive ? s.shadow : {}]}>
        <ListItem
          ref={ref => ref && action.refId && listEditor.add(ref, 'checklist-actions', action.refId)}
          title={action.description}
          subtitle={action.schedule.state.text}
          position={listItemPosition(index, actions.length)}
          titleNumberOfLines={1}
          drag={drag}
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
                onPress: () => deleteAction(index),
              },
            ],
          }}
          onSwipeableWillOpen={() =>
            action.refId && listEditor.onItemWillOpen('checklist-actions', action.refId)
          }
          onSwipeableWillClose={listEditor.onItemWillClose}
          onPress={() =>
            navigation.navigate('ChecklistActionEditor', {
              checklistAction: action,
              checklistType: type,
              modelId,
              eventName: `checklist-action-${eventNameId}`,
            })
          }
        />
      </View>
    );
  };

  return (
    <NestableScrollContainer
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'NAME & TYPE'} />
      <ListItemInput
        value={name.current}
        placeholder={editingTemplate ? 'Checklist Template Name' : 'Checklist Name'}
        position={['first']}
        disabled={type === ChecklistType.OneTimeMaintenance}
        onChangeText={value => setDebounced(() => (name.current = value))}
      />
      <ListItem
        title={editingTemplate ? 'Template for List Type' : 'List Type'}
        value={type}
        position={['last']}
        rightImage={type !== ChecklistType.OneTimeMaintenance}
        disabled={type === ChecklistType.OneTimeMaintenance}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: editingTemplate ? 'Template Type' : 'Checklist Type',
            headerBackTitle: 'Back',
            values: Object.values(ChecklistType).filter(
              t => t !== ChecklistType.OneTimeMaintenance,
            ),
            selected: type,
            eventName: `checklist-type-${eventNameId}`,
          })
        }
      />
      {actions.length > 0 && <Divider text={'ACTIONS'} />}
      <NestableDraggableFlatList
        data={actions}
        renderItem={renderChecklistAction}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        style={s.actionsList}
        animationConfig={{
          damping: 20,
          mass: 0.01,
          stiffness: 100,
          overshootClamping: false,
          restSpeedThreshold: 0.2,
          restDisplacementThreshold: 2,
        }}
        onDragEnd={({ data }) => reorderActions(data)}
      />
      <Divider />
      <ListItem
        title={'Add a New Action'}
        titleStyle={s.actionTitle}
        position={['first', 'last']}
        rightImage={false}
        onPress={() =>
          navigation.navigate('NewChecklistActionNavigator', {
            screen: 'NewChecklistAction',
            params: {
              checklistType: type,
              modelId,
              eventName: `checklist-action-${eventNameId}`,
            },
          })
        }
      />
      <Divider />
    </NestableScrollContainer>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  actionTitle: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.clearButtonText,
  },
  actionsList: {
    overflow: 'visible',
  },
  shadow: {
    ...theme.styles.shadowGlow,
    ...Platform.select({
      android: {
        borderRadius: 20,
      },
    }),
  },
}));

export default ChecklistEditorScreen;
