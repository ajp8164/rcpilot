import React, { useEffect, useRef, useState } from 'react';
import { Image, Keyboard, ScrollView, View } from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItem,
  ListItemInputMethods,
  ThemeManager,
  getColoredSvg,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useQuery, useRealm } from '@realm/react';
import { BatteryCellValuesEditorResult } from 'components/BatteryCellValuesEditorScreen';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemNotes } from 'components/atoms/List';
import { HeaderIconButton, headerOptions } from 'components/atoms/navigation';
import { EmptyView } from 'components/molecules/EmptyView';
import { EventRating } from 'components/molecules/EventRating';
import { Formik, FormikProps } from 'formik';
import {
  modelCostStatistics,
  modelEventOutcomeStatistics,
  useModelEventStyleStatistics,
} from 'lib/analytics';
import { batterySummary, batteryTintIconProps } from 'lib/battery';
import { actionScheduleState } from 'lib/checklist';
import { MSSToSeconds, secondsToFormat } from 'lib/formatters';
import { Masks, precisionFromMask } from 'lib/inputMasks';
import { modelHasPropeller, modelSummary, modelTypeIconProps } from 'lib/model';
import { eventKind, eventOutcomeIcons } from 'lib/modelEvent';
import { useConfirmAction } from 'lib/useConfirmAction';
import { BatteryLow, Check, X } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { toPlainObject } from 'realmdb';
import { Battery } from 'realmdb/Battery';
import {
  BatteryCycle,
  JBatteryDischarge,
  JBatteryDischargeValues,
} from 'realmdb/BatteryCycle';
import {
  ChecklistActionHistoryEntry,
  JChecklistAction,
} from 'realmdb/Checklist';
import { Commander } from 'realmdb/Commander';
import { Event } from 'realmdb/Event';
import { EventStyle } from 'realmdb/EventStyle';
import { Location } from 'realmdb/Location';
import { Model, ModelStatistics } from 'realmdb/Model';
import { ModelFuel } from 'realmdb/ModelFuel';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { selectCommander } from 'store/selectors/commanderSelectors';
import { selectEventSequence } from 'store/selectors/eventSequence';
import { eventSequence } from 'store/slices/eventSequence';
import { BatteryTint } from 'types/battery';
import { ChecklistType, EventSequenceChecklistType } from 'types/checklist';
import { EventOutcome } from 'types/event';
import { LocationPickerResult } from 'types/location';
import { EventSequenceNavigatorParamList } from 'types/navigation';
import { NotesEditorResult } from 'types/notes';
import * as Yup from 'yup';

// Order of fields for accessory view.
enum Fields {
  duration,
  fuelConsumed,
  dischargePackVoltage,
  dischargePackResistance,
}

type FormValues = {
  duration: string;
  fuelConsumed: string;
  fuel: ModelFuel;
  propeller: ModelPropeller;
  eventStyle: EventStyle;
  location: Location;
  commander: Commander;
  outcome: EventOutcome;
  notes: string;
};

export type Props = NativeStackScreenProps<
  EventSequenceNavigatorParamList,
  'EventSequenceNewEventEditor'
>;

const EventSequenceNewEventEditorScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const confirmAction = useConfirmAction();
  const modelEventStyleStatistics = useModelEventStyleStatistics();
  const event = useEvent();
  const dispatch = useDispatch();
  const realm = useRealm();

  const currentEventSequence = useSelector(selectEventSequence);
  const events = useQuery(Event);
  const model = useObject(
    Model,
    new BSON.ObjectId(currentEventSequence.modelId),
  );
  const checklists = useRef(
    model?.checklists.filter(
      c =>
        c.type === ChecklistType.PreEvent || c.type === ChecklistType.PostEvent,
    ),
  );
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const modelFuels = useQuery(ModelFuel);
  const modelPropellers = useQuery(ModelPropeller);
  const eventStyles = useQuery(EventStyle);
  const locations = useQuery(Location);
  const commanders = useQuery(Commander);

  const _commander = useSelector(selectCommander);
  const currentCommander = useObject(
    Commander,
    new BSON.ObjectId(_commander.commanderId),
  );

  const [now] = useState(DateTime.now());

  const [allBatteryDischarges, setAllBatteryDischarges] = useState<
    JBatteryDischarge[]
  >([]);
  const [kind] = useState(eventKind(model?.type));

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const durationFieldRef = useRef<ListItemInputMethods>(null);
  const fuelConsumedFieldRef = useRef<ListItemInputMethods>(null);
  const dischargePackVoltageFieldRef = useRef<ListItemInputMethods>(null);
  const dischargePackResistanceFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  const initialValues = {
    duration: secondsToFormat(currentEventSequence.duration.toString(), {
      format: 'm:ss',
    }),
    fuelConsumed: '',
    fuel: toPlainObject(model?.defaultFuel),
    propeller: toPlainObject(model?.defaultPropeller),
    eventStyle: toPlainObject(model?.defaultStyle),
    location: {},
    commander: currentCommander ? toPlainObject(currentCommander) : undefined,
    outcome: EventOutcome.Unspecified,
    notes: '',
  } as FormValues;

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [
        durationFieldRef.current,
        fuelConsumedFieldRef.current,
        dischargePackVoltageFieldRef.current,
        dischargePackResistanceFieldRef.current,
      ].filter(Boolean),
    );
  }, []);

  useEffect(() => {
    // Get all the batteries for this event.
    const eventBatteries: Battery[] = [];
    currentEventSequence.batteryIds.forEach(id => {
      const b = realm.objectForPrimaryKey(
        Battery,
        new BSON.ObjectId(new BSON.ObjectId(id)),
      );
      if (b) eventBatteries.push(b);
    });
    setBatteries(eventBatteries);

    // Create initial values for battery cell voltages and resistances.
    const initialBatteryDischarges = [] as JBatteryDischarge[];
    eventBatteries.forEach(battery => {
      initialBatteryDischarges.push({
        date: now.toISO(),
        duration: MSSToSeconds(initialValues.duration),
        packVoltage: 0,
        packResistance: 0,
        cellVoltage: new Array(battery.sCells).fill(0),
        cellResistance: new Array(battery.sCells).fill(0),
      });
    });
    setAllBatteryDischarges(initialBatteryDischarges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('event-model-fuel', onChangeModelFuel);
    event.on('event-model-propeller', onChangeModelPropeller);
    event.on('event-model-style', onChangeEventStyle);
    event.on('event-location', onChangeLocation);
    event.on('event-commander', onChangeCommander);
    event.on('event-outcome', onChangeOutcome);
    event.on('event-notes', onChangeNotes);
    event.on(`event-battery-cell-voltages`, onChangeDischargeCellVoltages);
    event.on(
      `event-battery-cell-resistances`,
      onChangeDischargeCellResistances,
    );
    event.on('event-location', onChangeLocation);

    return () => {
      event.removeListener('event-model-fuel', onChangeModelFuel);
      event.removeListener('event-model-propeller', onChangeModelPropeller);
      event.removeListener('event-model-style', onChangeEventStyle);
      event.removeListener('event-commander', onChangeCommander);
      event.removeListener('event-location', onChangeLocation);
      event.removeListener('event-outcome', onChangeOutcome);
      event.removeListener('event-notes', onChangeNotes);
      event.removeListener(
        `event-battery-cell-voltages`,
        onChangeDischargeCellVoltages,
      );
      event.removeListener(
        `event-battery-cell-resistances`,
        onChangeDischargeCellResistances,
      );
      event.removeListener('event-location', onChangeLocation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBatteryDischarges]);

  const schema = Yup.object().shape({
    duration: Yup.string().required(),
    fuelConsumed: Yup.string(),
    fuel: Yup.object().nullable(),
    propeller: Yup.object().nullable(),
    eventStyle: Yup.object().nullable(),
    location: Yup.object().nullable(),
    commander: Yup.object().nullable(),
    outcome: Yup.string(),
    notes: Yup.string(),
  });

  const cancel = () => {
    formikRef.current?.resetForm();
    dispatch(eventSequence.reset());
    Keyboard.dismiss();
    navigation.getParent()?.goBack();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
  };

  const onSubmit = (values: FormValues) => {
    if (model) {
      realm.write(() => {
        // For each battery we need to create a new battery cycle and then add the
        // battery cycle to the battery's list of cycles.
        const eventBatteryCycles = [] as BatteryCycle[];
        batteries.forEach((battery, index) => {
          const cycleNumber = battery.totalCycles ? battery.totalCycles + 1 : 1;

          const newCycle = realm.create('BatteryCycle', {
            cycleNumber,
            battery,
            excludeFromPlots: false,
            discharge: allBatteryDischarges[index],
          } as BatteryCycle);

          // Total cycles is tracked on the battery to enable a new battery to be created
          // with some number of unlogged cycles.
          battery.totalCycles = cycleNumber;
          battery.cycles.push(newCycle);

          // Attach the battery cycle to the event.
          eventBatteryCycles.push(newCycle);
        });

        // Update model attributes according to the event.
        // Note - update model before the checklist schedule since the scheduling relies
        // on current model state.
        const eventDuration = MSSToSeconds(values.duration);

        model.lastEvent = now.toISO();
        model.statistics.totalEvents = model.statistics.totalEvents + 1;
        model.statistics.totalTime = model.statistics.totalTime + eventDuration;

        model.statistics = {
          ...model.statistics,
          ...modelCostStatistics(model),
          ...modelEventOutcomeStatistics(model, values.outcome as EventOutcome),
          eventStyleData: modelEventStyleStatistics(
            'add',
            model,
            eventDuration,
            undefined,
            values.eventStyle,
          ),
        } as ModelStatistics;

        // Update model checklist actions.
        checklists.current?.forEach(checklist => {
          checklist.actions.forEach(action => {
            // Add a checklist action history entry to each action performed during this event.
            const historyEntry =
              currentEventSequence.checklistActionHistoryEntries[
                checklist.type as EventSequenceChecklistType
              ][action.refId];
            if (historyEntry) {
              action.history.push(historyEntry as ChecklistActionHistoryEntry);
            }

            // Update model checklist action schedule for next event.
            action.schedule.state = actionScheduleState(
              action as JChecklistAction,
              checklist.type,
              model,
            );
          });
        });

        const newEvent = realm.create('Event', {
          createdOn: now.toISO(),
          updatedOn: now.toISO(),
          date: now.toISO(),
          number: events.length + 1,
          outcome: values.outcome,
          duration: eventDuration,
          model,
          commander: realm.objectForPrimaryKey(
            'Commander',
            values.commander._id,
          ),
          location: values.location?._id
            ? realm.objectForPrimaryKey('Location', values.location._id)
            : null,
          fuel: values.fuel?._id
            ? realm.objectForPrimaryKey('ModelFuel', values.fuel._id)
            : null,
          fuelConsumed: Number(values.fuelConsumed),
          propeller: values.propeller?._id
            ? realm.objectForPrimaryKey('ModelPropeller', values.propeller._id)
            : null,
          eventStyle: values.eventStyle?._id
            ? realm.objectForPrimaryKey('EventStyle', values.eventStyle._id)
            : null,
          batteryCycles: eventBatteryCycles,
          notes: values.notes,
        } as Event);

        // Attach the event to the model.
        model.events.push(newEvent);
      });
    }

    dispatch(eventSequence.reset());
    navigation.getParent()?.goBack();
  };

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { isValid = false } = state;

    const canSubmit = isValid;
    setFormikCanSubmit(canSubmit);

    navigation.setOptions(
      headerOptions({
        headerTransparent: false,
        headerStyle: { backgroundColor: theme.colors.brandPrimary },
        headerShadowVisible: false,
        left: [
          <HeaderIconButton
            Icon={X}
            color={theme.colors.stickyWhite}
            onPress={() => {
              Keyboard.dismiss();
              confirmAction(
                {
                  label: `Do Not Log ${kind.name}`,
                  title: `This action cannot be undone.\nAre you sure you don't want to log this ${kind.name}?`,
                },
                cancel,
              );
            }}
          />,
        ],
        right: [
          <HeaderIconButton
            Icon={Check}
            color={theme.colors.stickyWhite}
            disabled={!canSubmit}
            onPress={save}
          />,
        ],
      }),
    );
  };

  const onChangeModelFuel = (result: EnumPickerResult) => {
    const f = modelFuels.find(f => {
      return f.name === result.value[0];
    });
    formikRef.current?.setFieldValue('fuel', toPlainObject(f));
  };

  const onChangeModelPropeller = (result: EnumPickerResult) => {
    const p = modelPropellers.find(p => {
      return p.name === result.value[0];
    });
    formikRef.current?.setFieldValue('propeller', toPlainObject(p));
  };

  const onChangeEventStyle = (result: EnumPickerResult) => {
    const s = eventStyles.find(s => {
      return s.name === result.value[0];
    });
    formikRef.current?.setFieldValue('eventStyle', toPlainObject(s));
  };

  const onChangeLocation = (result: LocationPickerResult) => {
    const l = locations.find(l => {
      return l._id.toString() === result.locationId;
    });
    formikRef.current?.setFieldValue('location', toPlainObject(l));
  };

  const onChangeCommander = (result: EnumPickerResult) => {
    const c = commanders.find(c => {
      return c.name === result.value[0];
    });
    formikRef.current?.setFieldValue('commander', toPlainObject(c));
  };

  const onChangeOutcome = (result: EnumPickerResult) => {
    formikRef.current?.setFieldValue('outcome', result.value[0]);
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    formikRef.current?.setFieldValue('notes', result.text);
  };

  const onChangeDischargeCellVoltages = (
    result: BatteryCellValuesEditorResult,
  ) => {
    // extraData is the battery index.
    setDischargeValue('cellVoltage', result.extraData, result.cellValues);
    setDischargeValue('packVoltage', result.extraData, result.packValue);
  };

  const onChangeDischargeCellResistances = (
    result: BatteryCellValuesEditorResult,
  ) => {
    // extraData is the battery index.
    setDischargeValue('cellResistance', result.extraData, result.cellValues);
    setDischargeValue('packResistance', result.extraData, result.packValue);
  };

  const setDischargeValue = (
    property: keyof JBatteryDischargeValues,
    index: number,
    value?: number | number[],
  ) => {
    const batteryDischarges = ([] as JBatteryDischarge[]).concat(
      allBatteryDischarges,
    );
    batteryDischarges[index][property] = (value ||
      new Array(batteries[index].sCells).fill(0)) as number & number[];
    setAllBatteryDischarges(batteryDischarges);
  };

  const renderBatteryPostEvent = ({
    battery,
    index,
  }: {
    battery: Battery;
    index: number;
  }) => {
    const batteryDischarge = allBatteryDischarges[index];
    const packVoltage = batteryDischarge.packVoltage;
    const cellVoltage = batteryDischarge.cellVoltage;
    const packResistance = batteryDischarge.packResistance;
    const cellResistance = batteryDischarge.cellResistance;
    return (
      <View key={battery._id.toString()}>
        <ListItem
          title={battery.name}
          value={batterySummary(battery)}
          valueStyle={theme.text.small}
          containerStyle={{
            ...s.batteryTint,
            borderLeftColor:
              battery.tint !== BatteryTint.None
                ? batteryTintIconProps[battery.tint].color
                : theme.colors.transparent,
          }}
          titleStyle={s.batteryText}
          subtitleStyle={s.batteryText}
          position={['first']}
          leftContentStyle={{ paddingHorizontal: 0 }}
          leftContent={
            <BatteryLow
              color={theme.colors.brandPrimary}
              style={s.batteryIcon}
              size={33}
            />
          }
        />
        <ListItemInput
          ref={dischargePackVoltageFieldRef}
          title={'Pack Voltage'}
          units={'V'}
          container={'right'}
          inputProps={{
            inputAccessoryViewID: 'keyboardAccessory',
            onChangeText: (_, unformatted) => {
              setDischargeValue(
                'packVoltage',
                index,
                unformatted ? parseFloat(unformatted) : undefined,
              );
              // Reset cell voltages if the pack value is changed.
              setDischargeValue('cellVoltage', index);
            },
            onFocus: () =>
              keyboardAccessory.current?.focusedField(
                Fields.dischargePackVoltage,
              ),
            value:
              packVoltage && packVoltage > 0
                ? packVoltage.toFixed(precisionFromMask(Masks.VOLTS))
                : '',
            mask: Masks.VOLTS,
            delimiter: '',
            rtlNumber: true,
            placeholder: 'Value',
            keyboardType: 'number-pad',
          }}
        />
        <ListItemInput
          ref={dischargePackResistanceFieldRef}
          title={'Pack Resistance'}
          units={'mΩ'}
          container={'right'}
          inputProps={{
            inputAccessoryViewID: 'keyboardAccessory',
            onChangeText: (_, unformatted) => {
              setDischargeValue(
                'packResistance',
                index,
                unformatted ? parseFloat(unformatted) : undefined,
              );
              // Reset cell resistances if the pack value is changed.
              setDischargeValue('cellResistance', index);
            },
            onFocus: () =>
              keyboardAccessory.current?.focusedField(
                Fields.dischargePackResistance,
              ),
            value:
              packResistance && packResistance > 0
                ? packResistance.toFixed(precisionFromMask(Masks.OHMS))
                : '',
            mask: Masks.OHMS,
            delimiter: '',
            rtlNumber: true,
            placeholder: 'Value',
            keyboardType: 'number-pad',
          }}
        />
        <ListItem
          title={'Cell Voltage'}
          rightContent={'chevron-right'}
          onPress={() =>
            navigation.navigate('BatteryCellValuesEditor', {
              config: {
                name: 'voltage',
                namePlural: 'voltages',
                units: 'V',
                mask: Masks.VOLTS,
                headerButtonStyle: {
                  color: theme.colors.stickyWhite,
                },
                extraData: index,
              },
              packValue: packVoltage || 0,
              cellValues: cellVoltage?.map(v => {
                return v || 0;
              }),
              sCells: battery.sCells,
              pCells: battery.pCells,
              eventName: `event-battery-cell-voltages`,
            })
          }
        />
        <ListItem
          title={'Cell Resistance'}
          position={['last']}
          rightContent={'chevron-right'}
          onPress={() =>
            navigation.navigate('BatteryCellValuesEditor', {
              config: {
                name: 'resistance',
                namePlural: 'resistances',
                units: 'mΩ',
                mask: Masks.OHMS,
                headerButtonStyle: {
                  color: theme.colors.stickyWhite,
                },
                extraData: index,
              },
              packValue: packResistance || 0,
              cellValues: cellResistance?.map(r => {
                return r || 0;
              }),
              sCells: battery.sCells,
              pCells: battery.pCells,
              eventName: `event-battery-cell-resistances`,
            })
          }
        />
      </View>
    );
  };

  if (!model) {
    return <EmptyView error message={'Model Not Found!'} />;
  }

  return (
    <>
      <AvoidSoftInputView style={[theme.styles.view]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}>
          <Divider />
          <ListItem
            title={model?.name}
            subtitle={modelSummary(model)}
            titleStyle={s.modelText}
            subtitleStyle={s.modelText}
            subtitleLines={2}
            position={['first', 'last']}
            leftContent={
              <View style={s.modelIconContainer}>
                {model.image ? (
                  <Image
                    source={{ uri: model.image }}
                    resizeMode={'cover'}
                    style={s.modelImage}
                  />
                ) : (
                  <View style={s.modelSvgContainer}>
                    <SvgXml
                      xml={getColoredSvg(modelTypeIconProps[model.type]?.name)}
                      width={s.modelImage.width}
                      height={s.modelImage.height}
                      color={theme.colors.brandSecondary}
                      style={s.modelIcon}
                    />
                  </View>
                )}
              </View>
            }
          />
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
                  onChange={onFormikWatcherStateChange}
                />
                <Divider />
                <ListItem
                  title={'Date'}
                  value={now.toFormat("MMM dd, yyyy 'at' h:mma")}
                  position={['first']}
                />
                <ListItemInput
                  ref={durationFieldRef}
                  title={'Duration'}
                  error={!!errors.duration}
                  units={'m:ss'}
                  container={'right'}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: (_, unformatted) =>
                      handleChange('duration')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.duration),
                    value: values.duration,
                    placeholder: '0:00',
                    mask: Masks.MINUTES_SECONDS,
                    rtlNumber: true,
                    keyboardType: 'number-pad',
                  }}
                />
                <ListItem
                  title={'Location'}
                  value={values.location?.name || 'Unknown'}
                  rightContent={'chevron-right'}
                  onPress={() =>
                    navigation.navigate('LocationNavigator', {
                      screen: 'LocationsMap',
                      params: {
                        eventName: 'event-location',
                        locationId: values.location?._id?.toString(),
                      },
                    })
                  }
                />
                <ListItem
                  title={'Outcome'}
                  position={['last']}
                  value={<EventRating value={values.outcome} />}
                  rightContent={'chevron-right'}
                  onPress={() =>
                    navigation.navigate('EnumPicker', {
                      title: `${kind.name} Outcome`,
                      headerBackTitle: `${kind.name}`,
                      headerBackgroundColor: theme.colors.brandPrimary,
                      values: Object.values(EventOutcome),
                      icons: eventOutcomeIcons,
                      selected: values.outcome,
                      eventName: 'event-outcome',
                    })
                  }
                />
                {modelHasPropeller(model.type) && (
                  <>
                    <Divider />
                    <ListItem
                      title={'Propeller'}
                      value={values.propeller?.name || 'None'}
                      position={['first', 'last']}
                      rightContent={'chevron-right'}
                      onPress={() =>
                        navigation.navigate('EnumPicker', {
                          enumName: 'ModelPropeller',
                          itemPlural: 'Propellers',
                          title: 'Default Propeller',
                          headerBackTitle: 'Model',
                          headerBackgroundColor: theme.colors.brandPrimary,
                          footer:
                            'You can manage propellers through the Globals section in the Setup tab.',
                          values: modelPropellers.map(p => {
                            return p.name;
                          }),
                          selected: values.propeller?.name,
                          mode: 'one-or-none',
                          eventName: 'event-model-propeller',
                        })
                      }
                    />
                  </>
                )}
                {model.logsFuel ? (
                  <>
                    <Divider />
                    <ListItem
                      title={'Fuel'}
                      position={['first']}
                      value={values.fuel?.name || 'Unspecified'}
                      rightContent={'chevron-right'}
                      onPress={() =>
                        navigation.navigate('EnumPicker', {
                          enumName: 'ModelFuel',
                          itemPlural: 'Fuel',
                          title: 'Fuel',
                          headerBackTitle: `${kind.name}`,
                          headerBackgroundColor: theme.colors.brandPrimary,
                          footer:
                            'You can manage fuels through the Globals section in the Setup tab.',
                          values: modelFuels.map(f => {
                            return f.name;
                          }),
                          selected: values.fuel?.name,
                          mode: 'one-or-none',
                          eventName: 'event-model-fuel',
                        })
                      }
                    />
                    <ListItemInput
                      ref={fuelConsumedFieldRef}
                      position={['last']}
                      title={'Fuel Consumed'}
                      units={'oz'}
                      container={'right'}
                      inputProps={{
                        inputAccessoryViewID: 'keyboardAccessory',
                        inputStyle: {
                          backgroundColor: theme.colors.transparent,
                          textAlign: 'right',
                        },
                        onChangeText: (_, unformatted) =>
                          handleChange('fuelConsumed')(unformatted),
                        onFocus: () =>
                          keyboardAccessory.current?.focusedField(
                            Fields.fuelConsumed,
                          ),
                        value: values.fuelConsumed,
                        placeholder: '0.00',
                        mask: Masks.OUNCES,
                        rtlNumber: true,
                        keyboardType: 'number-pad',
                      }}
                    />
                  </>
                ) : null}
                <Divider />
                <ListItem
                  title={'Commander'}
                  position={['first']}
                  value={values.commander?.name || 'Unknown'}
                  rightContent={'chevron-right'}
                  onPress={() =>
                    navigation.navigate('EnumPicker', {
                      enumName: 'Commander',
                      title: 'Commander',
                      itemPlural: 'Commanders',
                      headerBackTitle: `${kind.name}`,
                      headerBackgroundColor: theme.colors.brandPrimary,
                      footer:
                        'You can manage commanders through the Globals section in the Setup tab.',
                      values: commanders.map(c => {
                        return c.name;
                      }),
                      selected: values.commander?.name,
                      eventName: 'event-commander',
                    })
                  }
                />
                <ListItem
                  title={'Style'}
                  position={['last']}
                  value={values.eventStyle?.name || 'Unspecified'}
                  rightContent={'chevron-right'}
                  onPress={() =>
                    navigation.navigate('EnumPicker', {
                      enumName: 'EventStyle',
                      title: 'Event Style',
                      itemPlural: 'Event Styles',
                      headerBackTitle: `${kind.name}`,
                      headerBackgroundColor: theme.colors.brandPrimary,
                      footer:
                        'You can manage styles through the Globals section in the Setup tab.',
                      values: eventStyles.map(s => {
                        return s.name;
                      }),
                      selected: values.eventStyle?.name,
                      mode: 'one-or-none',
                      eventName: 'event-model-style',
                    })
                  }
                />
                <Divider text={'NOTES'} />
                <ListItemNotes
                  notes={values.notes}
                  position={['first', 'last']}
                  onPress={() =>
                    navigation.navigate('NotesEditor', {
                      title: 'Event Notes',
                      headerButtonStyle: {
                        color: theme.colors.stickyWhite,
                      },
                      headerBackgroundColor: theme.colors.brandPrimary,
                      text: values.notes,
                      eventName: 'event-notes',
                    })
                  }
                />
              </View>
            )}
          </Formik>
          {model.logsBatteries ? (
            <>
              <Divider text={'BATTERIES POST-EVENT'} />
              {batteries.map((battery, index) => {
                return renderBatteryPostEvent({ battery, index });
              })}
            </>
          ) : null}
          <Divider />
        </ScrollView>
      </AvoidSoftInputView>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={resolvedRefs}
        doneText={'Done'}
        disabledDone={!formikCanSubmit}
        onDone={Keyboard.dismiss}
      />
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  batteryIcon: {
    transform: [{ rotate: '-90deg' }],
  },
  batteryText: {
    left: 10,
    maxWidth: '90%',
  },
  batteryTint: {
    borderLeftWidth: 8,
  },
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  modelIconContainer: {
    position: 'absolute',
    left: -15,
  },
  modelImage: {
    width: 150,
    height: 85,
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
  modelText: {
    left: 140,
    maxWidth: '48%',
  },
}));

export default EventSequenceNewEventEditorScreen;
