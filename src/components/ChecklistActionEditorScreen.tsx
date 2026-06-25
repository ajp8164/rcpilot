import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';

import { useEvent, useSetState } from '@react-native-hello/core';
import {
  CollapsibleView,
  Divider,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItem,
  ListItemCollapsible,
  ListItemSwitch,
  WheelPicker,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject } from '@realm/react';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import {
  ListItemInput,
  ListItemInputMethods,
  ListItemNotes,
} from 'components/atoms/List';
import { HeaderIconButton, headerOptions } from 'components/atoms/navigation';
import { Formik, FormikProps } from 'formik';
import {
  actionScheduleState,
  getChecklistActionScheduleItems,
} from 'lib/checklist';
import { secondsToFormat } from 'lib/formatters';
import { Masks } from 'lib/inputMasks';
import { eventKind } from 'lib/modelEvent';
import { Check, X } from 'lucide-react-native';
import { DateTime } from 'luxon';
import Realm, { BSON } from 'realm';
import { ChecklistActionSchedule, JChecklistAction } from 'realmdb/Checklist';
import { Model } from 'realmdb/Model';
import {
  ChecklistActionNonRepeatingScheduleTimeframe,
  ChecklistActionScheduleFollowing,
  ChecklistActionSchedulePeriod,
  ChecklistActionScheduleType,
  ChecklistActionScheduleWhenPerform,
  ChecklistType,
} from 'types/checklist';
import { ISODateString } from 'types/common';
import {
  ModelsNavigatorParamList,
  NewChecklistActionNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';
import { NotesEditorResult } from 'types/notes';
import * as Yup from 'yup';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ChecklistActionEditor'>,
  CompositeScreenProps<
    NativeStackScreenProps<ModelsNavigatorParamList, 'ChecklistActionEditor'>,
    NativeStackScreenProps<
      NewChecklistActionNavigatorParamList,
      'NewChecklistAction'
    >
  >
>;

// Order of fields for accessory view.
enum Fields {
  description,
  cost,
  notes,
}

type FormValues = {
  description: string;
  cost: string;
  notes: string;
};

const ChecklistActionEditorScreen = ({ navigation, route }: Props) => {
  const { checklistType, checklistAction, modelId, eventName } = route.params;

  const theme = useTheme();
  const event = useEvent();

  // If a model id is provided then this action is attached to a checklist on the model, not a checklist template.
  const model = useObject(Model, new BSON.ObjectId(modelId));

  const action = useRef(checklistAction).current;

  // Force non-repeating items for creating a one-time maintenance action.
  const initialScheduleItems = useRef(
    getChecklistActionScheduleItems(
      action?.schedule.type ||
        checklistType === ChecklistType.OneTimeMaintenance
        ? ChecklistActionScheduleType.NonRepeating
        : ChecklistActionScheduleType.Repeating,
    ),
  ).current;

  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);
  const schedulePickerItems = useRef(initialScheduleItems.items);
  const [schedulePickerValue, setSchedulePickerValue] = useState<string[]>(
    action
      ? [action.schedule.value.toString(), action.schedule.period]
      : initialScheduleItems.default.items,
  );

  const [selectedSchedule, setSelectedSchedule] =
    useSetState<Omit<ChecklistActionSchedule, keyof Realm.Object>>();

  const [scheduleStr, setScheduleStr] = useState({
    following: '',
    whenPerform: '',
    whenPerformValue: '',
  });

  const initialValues = useMemo(() => {
    return {
      description: action?.description || '',
      cost: action?.cost?.toFixed(2) || '',
      notes: action?.notes || '',
    } as FormValues;
  }, [action]);

  const schema = Yup.object().shape({
    description: Yup.string().required(),
    cost: Yup.string(),
    notes: Yup.string(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const descriptionFieldRef = useRef<ListItemInputMethods>(null);
  const costFieldRef = useRef<ListItemInputMethods>(null);

  useEffect(() => {
    if (checklistType === ChecklistType.OneTimeMaintenance) {
      // Set the selected schedule to 'Today' (appears in non-repeating schedule only).
      // items first index = value wheel, items second index = timeframe wheel
      const todayIndex = initialScheduleItems.items[1].findIndex(
        k => k.label === ChecklistActionNonRepeatingScheduleTimeframe.Today,
      );
      setSchedulePickerValue([
        initialScheduleItems.items[0][0].label,
        initialScheduleItems.items[1][todayIndex].label,
      ]);

      // Only need to specify the type, other properties set via hook.
      setSelectedSchedule({
        type: ChecklistActionScheduleType.NonRepeating,
      });
    } else if (!action) {
      // Default values for a new action.
      setSelectedSchedule({
        period: initialScheduleItems.default.frequency,
        type: ChecklistActionScheduleType.Repeating,
        value: Number(initialScheduleItems.default.value),
      });
    } else {
      setSelectedSchedule(action.schedule);
    }

    // Initialize wheel items based on schedule type.
    schedulePickerItems.current = getChecklistActionScheduleItems(
      action?.schedule.type,
    ).items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    event.on('checklist-action-notes', onChangeNotes);
    return () => {
      event.removeListener('checklist-action-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let following: ISODateString | string = '';
    let followingStr = '';
    const period = schedulePickerValue[1] as ChecklistActionSchedulePeriod;
    const whenPerformValue = whenPerformValueToString(
      schedulePickerValue[0],
      schedulePickerValue[1],
    );

    // Set strings based on selected action schedule.
    switch (period) {
      case ChecklistActionSchedulePeriod.Events:
        if (
          selectedSchedule.type === ChecklistActionScheduleType.NonRepeating
        ) {
          if (!model) {
            followingStr = ChecklistActionScheduleFollowing.EventAtInstall;
          } else {
            const followingEventNumber = model?.statistics.totalEvents
              ? model.statistics.totalEvents + 1
              : 1;
            following = `${followingEventNumber}`;
            followingStr = `${eventKind(model.type).name} #${followingEventNumber}`;
          }
        }
        setScheduleStr({
          following: followingStr,
          whenPerform:
            selectedSchedule.type === ChecklistActionScheduleType.NonRepeating
              ? ChecklistActionScheduleWhenPerform.After
              : ChecklistActionScheduleWhenPerform.Every,
          whenPerformValue,
        });
        break;

      case ChecklistActionSchedulePeriod.ModelMinutes:
        if (
          selectedSchedule.type === ChecklistActionScheduleType.NonRepeating
        ) {
          if (!model) {
            followingStr = ChecklistActionScheduleFollowing.TimeAtInstall;
          } else {
            following = `${model.statistics.totalTime}`;
            followingStr = `Total Time ${secondsToFormat(model.statistics.totalTime, { format: "h'h' m'm'" })}`;
          }
        }
        setScheduleStr({
          following: followingStr,
          whenPerform:
            selectedSchedule.type === ChecklistActionScheduleType.NonRepeating
              ? ChecklistActionScheduleWhenPerform.After
              : ChecklistActionScheduleWhenPerform.Every,
          whenPerformValue,
        });
        break;

      case ChecklistActionSchedulePeriod.Days:
      case ChecklistActionSchedulePeriod.Weeks:
      case ChecklistActionSchedulePeriod.Months:
        if (
          selectedSchedule.type === ChecklistActionScheduleType.NonRepeating
        ) {
          if (!model) {
            followingStr = ChecklistActionScheduleFollowing.InstallDate;
          } else {
            following = DateTime.now().toISO();
            followingStr = DateTime.now().toFormat('MMMM d, yyyy');
          }
        }
        setScheduleStr({
          following: followingStr,
          whenPerform:
            selectedSchedule.type === ChecklistActionScheduleType.NonRepeating
              ? ChecklistActionScheduleWhenPerform.In
              : ChecklistActionScheduleWhenPerform.Every,
          whenPerformValue,
        });
        break;

      case ChecklistActionSchedulePeriod.Today:
        setScheduleStr({
          following: '',
          whenPerform: ChecklistActionScheduleWhenPerform.Now,
          whenPerformValue,
        });
        break;
    }

    setSelectedSchedule(prevState => {
      return {
        ...prevState,
        following,
        period,
        value: Number(schedulePickerValue[0]),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedulePickerValue, selectedSchedule.type]);

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
    const result: JChecklistAction = {
      history: [],
      ...action,
      description: values.description || '',
      schedule: selectedSchedule,
      cost: Number(values.cost) || undefined,
      notes: values.notes,
    };
    result.schedule.state = actionScheduleState(
      result,
      checklistType,
      model || undefined,
    );

    event.emit(eventName, result);
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    formikRef.current?.setFieldValue('notes', result.text);
  };

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);

    navigation.setOptions(
      headerOptions({
        left: [<HeaderIconButton Icon={X} onPress={cancel} />],
        right: [
          <HeaderIconButton
            Icon={Check}
            disabled={!canSubmit}
            onPress={save}
          />,
        ],
      }),
    );
  };

  const whenPerformValueToString = (value: string, period: string) => {
    if (period === ChecklistActionNonRepeatingScheduleTimeframe.Today) {
      return period;
    } else {
      return `${value} ${Number(value) > 1 ? period : period.replace(/s$/, '')}`;
    }
  };

  const toggleActionRepeats = (value: boolean) => {
    const newType = value
      ? ChecklistActionScheduleType.Repeating
      : ChecklistActionScheduleType.NonRepeating;

    setSelectedSchedule(prevState => {
      return {
        ...prevState,
        type: newType,
      };
    });
    // If there are changes to the items then the picker wheel is updated.
    schedulePickerItems.current =
      getChecklistActionScheduleItems(newType).items;
  };

  const hideValueWheel =
    schedulePickerValue[1] ===
    ChecklistActionNonRepeatingScheduleTimeframe.Today;

  return (
    <>
      <ScrollView
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
          enableReinitialize
          onSubmit={onSubmit}>
          {({ handleChange, values, errors }) => (
            <View>
              <FormikStateWatcher<FormValues>
                onChange={onFormikWatcherStateChange}
              />
              <Divider text={'PERFORM'} />
              <ListItemInput
                ref={descriptionFieldRef}
                position={['first', 'last']}
                error={!!errors.description}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('description'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.description),
                  value: values.description,
                  label: 'Action Description',
                  placeholder: 'Brief action description',
                  autoCapitalize: 'words',
                }}
              />
              <Divider text={'ON SCHEDULE'} />
              <ListItemCollapsible
                title={scheduleStr.whenPerform}
                value={scheduleStr.whenPerformValue}
                position={
                  action?.history.length && scheduleStr.following
                    ? ['first']
                    : action?.history.length
                      ? ['first', 'last']
                      : ['first']
                }
                initExpanded={schedulePickerOpen}
                onPress={() => setSchedulePickerOpen(!schedulePickerOpen)}>
                {/* Wheel index 0 is value, wheel index 1 is timeframe/frequency. */}
                <WheelPicker
                  placeholder={'none'}
                  itemWidth={hideValueWheel ? ['0%', '100%'] : ['30%', '70%']}
                  wheelVisible={[!hideValueWheel, true]}
                  items={schedulePickerItems.current}
                  value={schedulePickerValue}
                  onValueChange={(_wheelIndex, value, _index) => {
                    setSchedulePickerValue(value as string[]);
                  }}
                />
              </ListItemCollapsible>
              <CollapsibleView expanded={!!scheduleStr.following}>
                <ListItem
                  title={'Following'}
                  value={scheduleStr.following}
                  position={
                    action?.schedule.type ===
                      ChecklistActionScheduleType.NonRepeating &&
                    action?.history.length > 0
                      ? ['last']
                      : []
                  }
                />
              </CollapsibleView>
              {!action?.history.length && (
                <ListItemSwitch
                  title={'Action Repeats'}
                  value={
                    selectedSchedule.type ===
                    ChecklistActionScheduleType.Repeating
                  }
                  disabled={
                    selectedSchedule.period ===
                    ChecklistActionNonRepeatingScheduleTimeframe.Today
                  }
                  position={['last']}
                  onValueChange={toggleActionRepeats}
                />
              )}
              {checklistType === ChecklistType.OneTimeMaintenance ? (
                <Divider
                  note
                  light
                  subHeaderStyle={theme.text.medium}
                  text={
                    'Changes to the action are limited. This is a one-time maintenance action.'
                  }
                />
              ) : action?.history.length ? (
                <Divider
                  note
                  light
                  subHeaderStyle={theme.text.medium}
                  text={
                    'Changes to the action are limited. This action has been performed at least once.'
                  }
                />
              ) : null}
              {(checklistType === ChecklistType.Maintenance ||
                checklistType === ChecklistType.OneTimeMaintenance) && (
                <>
                  <Divider text={'MAINTENANCE COSTS'} />
                  <ListItemInput
                    ref={costFieldRef}
                    position={['first', 'last']}
                    title={'Total Costs'}
                    container={'right'}
                    inputProps={{
                      inputAccessoryViewID: 'keyboardAccessory',
                      onChangeText: (_, unformatted) =>
                        handleChange('cost')(unformatted),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(Fields.cost),
                      value: values.cost,
                      placeholder: '$0.00',
                      mask: Masks.CURRENCY,
                      rtlNumber: true,
                      keyboardType: 'number-pad',
                    }}
                  />
                </>
              )}
              <Divider text={'NOTES'} />
              <ListItemNotes
                notes={values.notes}
                position={['first', 'last']}
                onPress={() =>
                  navigation.navigate('NotesEditor', {
                    title: 'Action Notes',
                    text: values.notes,
                    eventName: 'checklist-action-notes',
                  })
                }
              />
            </View>
          )}
        </Formik>
        {modelId && action && (
          <>
            <Divider text={'LOG'} />
            <ListItem
              title={'Action Log'}
              value={
                action.history.length === 1
                  ? `${action.history.length} entry`
                  : `${action.history.length} entries`
              }
              position={['first', 'last']}
              onPress={() =>
                navigation.navigate('ChecklistActionHistory', {
                  action,
                  modelId,
                })
              }
            />
          </>
        )}
      </ScrollView>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={[descriptionFieldRef.current, costFieldRef.current]}
        doneText={'Done'}
        disabledDone={!formikCanSubmit}
        onDone={Keyboard.dismiss}
      />
    </>
  );
};

export default ChecklistActionEditorScreen;
