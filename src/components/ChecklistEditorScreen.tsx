import * as Yup from 'yup';
import {
  Divider,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItem,
  ListItemSwipeable,
  listItemPosition,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { makeStyles } from '@rn-vui/themed';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemInputMethods } from 'components/atoms/List';
import { Formik, FormikProps } from 'formik';
import { useEvent } from 'lib/event';
import { useConfirmAction } from 'lib/useConfirmAction';
import { uuidv4 } from 'lib/utils';
import { CircleMinus, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, LayoutRectangle, View } from 'react-native';
import {
  DragEndParams,
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { BSON } from 'realm';
import {
  Checklist,
  ChecklistAction,
  JChecklistAction,
} from 'realmdb/Checklist';
import { ChecklistTemplate } from 'realmdb/ChecklistTemplate';
import { Model } from 'realmdb/Model';
import { AppTheme, useTheme } from 'theme';
import { ChecklistType } from 'types/checklist';
import {
  ModelsNavigatorParamList,
  NewChecklistNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistEditor'>,
  CompositeScreenProps<
    NativeStackScreenProps<ModelsNavigatorParamList, 'ChecklistEditor'>,
    NativeStackScreenProps<NewChecklistNavigatorParamList, 'NewChecklist'>
  >
>;

// Order of fields for accessory view.
enum Fields {
  name,
}

type FormValues = {
  name: string;
  type: ChecklistType;
  actions: JChecklistAction[];
};

const ChecklistEditorScreen = ({ navigation, route }: Props) => {
  const { checklistTemplateId, modelId, modelChecklistRefId } =
    route.params || {};

  const theme = useTheme();
  const s = useStyles(theme);
  const confirmAction = useConfirmAction();
  const event = useEvent();
  const realm = useRealm();

  // This editor provides capability for checklist templates and model checklists. We use a
  // 'working' reference to the correct object throughout the editor.
  const checklistTemplate = useObject(
    ChecklistTemplate,
    new BSON.ObjectId(checklistTemplateId),
  );

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const modelChecklist = model?.checklists.find(
    c => c.refId === modelChecklistRefId,
  );

  const editingTemplate = useRef(!modelId).current; // This is a template editor if no modelId.
  const eventNameId = useRef(uuidv4()).current; // Used for unique action change event name.

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();
  const [listLayout, setListLayout] = useState<LayoutRectangle>();

  const initialValues = {
    name: checklistTemplate?.name || modelChecklist?.name || undefined,
    type:
      checklistTemplate?.type || modelChecklist?.type || ChecklistType.PreEvent,
    actions:
      // Need to convert the model checklist actions into a plain object to decouple from the realm array instance.
      checklistTemplate?.actions.toJSON() ||
      (modelChecklist !== undefined
        ? JSON.parse(JSON.stringify(modelChecklist.actions))
        : []),
  } as FormValues;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    type: Yup.string().required(),
    actions: Yup.array().of(Yup.object()),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);

  useEffect(() => {
    if (!formikRef.current?.values.actions.length) return;
    navigation.setOptions({
      headerRight: renderListEditButton,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listEditorState]);

  const cancel = () => {
    formikRef.current?.resetForm();
    Keyboard.dismiss();
    navigation.goBack();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    navigation.goBack();
  };

  const onSubmit = (values: FormValues) => {
    if (editingTemplate) {
      // Not a model checklist, handle saving a checklist template.
      if (checklistTemplate) {
        realm.write(() => {
          checklistTemplate.name = values.name || 'no-name';
          checklistTemplate.type = values.type;
          // Existing actions are saved inline with edits/adds.
        });
      } else {
        realm.write(() => {
          realm.create('ChecklistTemplate', {
            name: values.name,
            type: values.type,
            actions: values.actions,
          });
        });
      }
    } else {
      // Is a model checklist, handle updating the checklist on the model.
      if (model && modelChecklist) {
        // Update an existing model checklist.
        realm.write(() => {
          const index = model?.checklists.findIndex(
            c => c.refId === modelChecklistRefId,
          );
          model.checklists[index].name = values.name || 'no-name';
          model.checklists[index].type = values.type;
          // Existing actions are saved inline with edits/adds.
        });
      } else {
        // Create a new checklist on the model.
        realm.write(() => {
          const newModelChecklist = {
            refId: uuidv4(),
            name: values.name,
            type: values.type,
            actions: values.actions,
          } as Checklist;

          model?.checklists.push(newModelChecklist);
        });
      }
    }
  };

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);

    navigation.setOptions({
      headerLeft: () => {
        if (next.dirty) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={cancel}
            />
          );
        }
      },
      headerRight: () => {
        if (next.dirty || next.values.actions.length === 0) {
          return (
            <Button
              title={'Save'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledTitleStyle={theme.styles.buttonScreenHeaderTitle}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!canSubmit}
              onPress={save}
            />
          );
        } else if (next.values.actions.length > 0) {
          return renderListEditButton();
        }
      },
    });
  };

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
          checklistTemplate.actions = formikRef.current?.values.actions;
        });
      }
    } else {
      if (model && modelChecklist) {
        // Update an existing model checklist.
        realm.write(() => {
          const index = model.checklists.findIndex(
            c => c.refId === modelChecklistRefId,
          );
          model.checklists[index].actions = (formikRef.current?.values
            .actions || []) as ChecklistAction[];
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formikRef.current?.values.actions]);

  const onChangeType = (result: EnumPickerResult) => {
    formikRef.current?.setFieldValue('type', result.value[0]);
  };

  const upsertAction = (newOrChangedAction: JChecklistAction) => {
    if (newOrChangedAction.refId !== undefined) {
      // Update existing action.
      const actns = [...(formikRef.current?.values.actions || [])];
      const index = actns.findIndex(a => a.refId === newOrChangedAction.refId);
      actns[index] = newOrChangedAction;

      formikRef.current?.setFieldValue('actions', actns);
    } else {
      // Insert a new action.
      newOrChangedAction.refId = uuidv4();
      formikRef.current?.setFieldValue(
        'actions',
        [...formikRef.current.values.actions].concat(newOrChangedAction),
      );
    }
  };

  const deleteAction = (index: number) => {
    if ((editingTemplate && checklistTemplate) || modelChecklist) {
      const a = [...(formikRef.current?.values.actions || [])];
      a.splice(index, 1);
      formikRef.current?.setFieldValue('actions', a);
    }
  };

  const reorderActions = (params: DragEndParams<JChecklistAction>) => {
    const { data } = params;
    formikRef.current?.setFieldValue('actions', data);
  };

  const renderListEditButton = () => {
    return (
      <Button
        title={listEditorState?.enabled ? 'Done' : 'Edit'}
        titleStyle={theme.styles.buttonScreenHeaderTitle}
        buttonStyle={theme.styles.buttonScreenHeader}
        onPress={() => listEditorRef.current?.onToggleEditMode()}
      />
    );
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
      <ListItemSwipeable
        title={action.description}
        subtitle={action.schedule.state.text}
        position={listItemPosition(
          index,
          formikRef.current?.values.actions.length || 0,
        )}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('ChecklistActionEditor', {
            checklistAction: action,
            checklistType:
              formikRef.current?.values.type || ChecklistType.PreEvent,
            modelId,
            eventName: `checklist-action-${eventNameId}`,
          })
        }
        drag={drag}
        dragIsActive={isActive}
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
          draggable: true,
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
                label: 'Delete Action',
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this checklist action?',
              });
            },
            onPress: () => deleteAction(index),
          },
        ]}
      />
    );
  };

  return (
    <>
      <ListEditor
        ref={listEditorRef}
        onChangeState={setListEditorState}
        listLayout={listLayout}>
        <NestableScrollContainer
          style={theme.styles.view}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}>
          <Formik
            innerRef={formik => {
              if (formik) {
                formikRef.current = formik;
              }
            }}
            initialValues={initialValues}
            validationSchema={schema}
            validateOnMount
            onSubmit={onSubmit}>
            {({ errors, handleChange, values }) => (
              <View>
                <FormikStateWatcher<FormValues>
                  dirtyIgnoreFields={['actions']}
                  onChange={onFormikWatcherStateChange}
                />
                <Divider text={'NAME & TYPE'} />
                <ListItemInput
                  ref={nameFieldRef}
                  error={!!errors.name}
                  position={['first']}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: handleChange('name'),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.name),
                    value: values.name,
                    label: editingTemplate
                      ? 'Checklist Template Name'
                      : 'Checklist Name',
                    placeholder: editingTemplate
                      ? 'Checklist Template Name'
                      : 'Checklist Name',
                    editable: values.type !== ChecklistType.OneTimeMaintenance,
                    autoCapitalize: 'words',
                  }}
                />
                <ListItem
                  title={
                    editingTemplate ? 'Template for List Type' : 'List Type'
                  }
                  value={values.type}
                  position={['last']}
                  rightContent={
                    values.type !== ChecklistType.OneTimeMaintenance
                      ? 'chevron-right'
                      : undefined
                  }
                  disabled={values.type === ChecklistType.OneTimeMaintenance}
                  onPress={() =>
                    navigation.navigate('EnumPicker', {
                      title: editingTemplate
                        ? 'Template Type'
                        : 'Checklist Type',
                      headerBackTitle: 'Back',
                      values: Object.values(ChecklistType).filter(
                        t => t !== ChecklistType.OneTimeMaintenance,
                      ),
                      selected: values.type,
                      eventName: `checklist-type-${eventNameId}`,
                    })
                  }
                />
                <Divider
                  text={'ACTIONS'}
                  rightComponent={
                    <Button
                      icon={
                        <Plus color={theme.colors.screenHeaderButtonText} />
                      }
                      buttonStyle={theme.styles.dividerButton}
                      onPress={() =>
                        navigation.navigate('NewChecklistActionNavigator', {
                          screen: 'NewChecklistAction',
                          params: {
                            checklistType:
                              values.type || ChecklistType.PreEvent,
                            modelId,
                            eventName: `checklist-action-${eventNameId}`,
                          },
                        })
                      }
                    />
                  }
                />
                {values.actions.length ? (
                  <View
                    style={[{ flex: 1 }]}
                    onLayout={e => setListLayout(e.nativeEvent.layout)}>
                    <NestableDraggableFlatList
                      data={[...values.actions]}
                      renderItem={renderChecklistAction}
                      keyExtractor={item => `${item.refId}`}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={false}
                      style={s.actionsList}
                      onDragEnd={reorderActions}
                    />
                  </View>
                ) : (
                  <Divider
                    note
                    light
                    subHeaderStyle={{ textAlign: 'center' }}
                    text={"Tap '+' to add a new action."}
                  />
                )}
                <Divider />
              </View>
            )}
          </Formik>
        </NestableScrollContainer>
      </ListEditor>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={[nameFieldRef.current]}
        doneText={'Save'}
        disabledDone={!formikCanSubmit}
        onDone={save}
      />
    </>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  actionsList: {
    overflow: 'visible',
  },
}));

export default ChecklistEditorScreen;
