import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, Text, View } from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItem,
  ListItemDateTime,
  ListItemSwitch,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { BatteryCellValuesEditorResult } from 'components/BatteryCellValuesEditorScreen';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import {
  ListItemInput,
  ListItemInputMethods,
  ListItemNotes,
} from 'components/atoms/List';
import { EmptyView } from 'components/molecules/EmptyView';
import { Formik, FormikProps } from 'formik';
import { batterySummary, batteryTintIconProps } from 'lib/battery';
import { batteryCycleStatisticsData } from 'lib/batteryCycle';
import { MSSToSeconds, secondsToFormat } from 'lib/formatters';
import { Masks } from 'lib/inputMasks';
import { BatteryFull, BatteryLow } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { BatteryCharge, BatteryDischarge } from 'realmdb/BatteryCycle';
import { toNumber } from 'realmdb/helpers';
import { BatteryTint } from 'types/battery';
import { ISODateString } from 'types/common';
import { BatteriesNavigatorParamList } from 'types/navigation';
import * as Yup from 'yup';

// Order of fields for accessory view.
enum Fields {
  dischargeDuration,
  dischargePackVoltage,
  dischargePackResistance,
  chargeAmount,
  chargePackVoltage,
  chargePackResistance,
}

type FormValues = {
  chargeAmount: string;
  chargeCellResistances: string[];
  chargeCellVoltages: string[];
  chargeDate: ISODateString;
  chargePackResistance: string;
  chargePackVoltage: string;
  dischargeCellResistances: string[];
  dischargeCellVoltages: string[];
  dischargeDate: ISODateString;
  dischargeDuration: string;
  dischargePackResistance: string;
  dischargePackVoltage: string;
  excludeFromPlots: boolean;
  isCharged: boolean;
  notes: string;
};

export type Props = NativeStackScreenProps<
  BatteriesNavigatorParamList,
  'BatteryCycleEditor'
>;

const BatteryCycleEditorScreen = ({ navigation, route }: Props) => {
  const { batteryId, cycleNumber } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const event = useEvent();

  const realm = useRealm();
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));
  const cycle = battery?.cycles.find(c => {
    return c.cycleNumber === cycleNumber;
  });
  const isCharged =
    battery?.cycles[battery.cycles.length - 1]?.charge ||
    !battery?.cycles.length;

  const batteryCycleStats = cycle && batteryCycleStatisticsData(cycle);

  const [expandedDischargeDate, setExpandedDischargeDate] = useState(false);
  const [expandedChargeDate, setExpandedChargeDate] = useState(false);

  const dischargeDurationRef = useRef<ListItemInputMethods>(null);
  const dischargePackResistanceRef = useRef<ListItemInputMethods>(null);
  const dischargePackVoltageRef = useRef<ListItemInputMethods>(null);
  const chargeAmountRef = useRef<ListItemInputMethods>(null);
  const chargePackResistanceRef = useRef<ListItemInputMethods>(null);
  const chargePackVoltageRef = useRef<ListItemInputMethods>(null);

  const initialValues = {
    chargeAmount: battery?.capacity?.toFixed() || '',
    chargeDate: cycle?.charge?.date || '',
    chargeCellResistances: battery
      ? new Array(battery.sCells * battery.pCells).fill('0')
      : [],
    chargeCellVoltages: battery
      ? new Array(battery.sCells * battery.pCells).fill('0')
      : [],
    chargePackResistance: '',
    chargePackVoltage: '',
    dischargeDate: cycle?.discharge?.date || '',
    dischargeDuration: secondsToFormat(cycle?.discharge?.duration, {
      format: 'm:ss',
    }),
    dischargeCellVoltages: battery
      ? new Array(battery.sCells * battery.pCells).fill('0')
      : [],
    dischargeCellResistances: battery
      ? new Array(battery.sCells * battery.pCells).fill('0')
      : [],
    dischargePackResistance: '',
    dischargePackVoltage: '',
    excludeFromPlots: false,
    isCharged: false,
    notes: '',
  } as FormValues;

  const schema = Yup.object().shape({
    chargeAmount: Yup.string().when('isCharged', {
      is: true,
      then: Yup.string().required(),
      otherwise: Yup.string(),
    }),
    chargeCellResistances: Yup.array().of(Yup.string()),
    chargeCellVoltages: Yup.array().of(Yup.string()),
    chargeDate: Yup.string().when('isCharged', {
      is: true,
      then: Yup.string().required(),
      otherwise: Yup.string(),
    }),
    chargePackResistance: Yup.string(),
    chargePackVoltage: Yup.string(),
    dischargeCellResistances: Yup.array().of(Yup.string()),
    dischargeCellVoltages: Yup.array().of(Yup.string()),
    dischargeDate: Yup.string().required(),
    dischargeDuration: Yup.string().required(),
    dischargePackResistance: Yup.string(),
    dischargePackVoltage: Yup.string(),
    excludeFromPlots: Yup.boolean(),
    notes: Yup.string(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const dischargeDurationFieldRef = useRef<ListItemInputMethods>(null);
  const dischargePackVoltageFieldRef = useRef<ListItemInputMethods>(null);
  const dischargePackResistanceFieldRef = useRef<ListItemInputMethods>(null);
  const chargeAmountFieldRef = useRef<ListItemInputMethods>(null);
  const chargePackVoltageFieldRef = useRef<ListItemInputMethods>(null);
  const chargePackResistanceFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [
        dischargeDurationFieldRef.current,
        dischargePackVoltageFieldRef.current,
        dischargePackResistanceFieldRef.current,
        chargeAmountFieldRef.current,
        chargePackVoltageFieldRef.current,
        chargePackResistanceFieldRef.current,
      ].filter(Boolean),
    );
  }, []);

  useEffect(() => {
    event.on(
      'battery-discharge-cell-resistances',
      onChangeDischargeCellResistances,
    );
    event.on('battery-discharge-cell-voltages', onChangeDischargeCellVoltages);
    event.on('battery-charge-cell-resistances', onChangeChargeCellResistances);
    event.on('battery-charge-cell-voltages', onChangeChargeCellVoltages);
    event.on('battery-cycle-notes', onChangeNotes);
    return () => {
      event.removeListener(
        'battery-discharge-cell-resistances',
        onChangeDischargeCellResistances,
      );
      event.removeListener(
        'battery-discharge-cell-voltages',
        onChangeDischargeCellVoltages,
      );
      event.removeListener(
        'battery-charge-cell-resistances',
        onChangeChargeCellResistances,
      );
      event.removeListener(
        'battery-charge-cell-voltages',
        onChangeChargeCellVoltages,
      );
      event.removeListener('battery-cycle-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    formikRef.current?.setFieldValue('isCharged', isCharged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    Keyboard.dismiss();
    formikRef.current?.resetForm();
    navigation.goBack();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    navigation.goBack();
  };

  const onSubmit = (values: FormValues) => {
    if (!cycle) return;

    realm.write(() => {
      cycle.discharge = {
        date: values.dischargeDate,
        duration: values.dischargeDuration
          ? MSSToSeconds(values.dischargeDuration)
          : 0,
        packVoltage: toNumber(values.dischargePackVoltage),
        packResistance: toNumber(values.dischargePackResistance),
        cellVoltage: values.dischargeCellVoltages?.map(v => {
          return parseFloat(v);
        }),
        cellResistance: values.dischargeCellResistances?.map(r => {
          return parseFloat(r);
        }),
      } as BatteryDischarge;
      if (cycle.charge) {
        cycle.charge = {
          date: values.chargeDate,
          amount: toNumber(values.chargeAmount),
          packVoltage: toNumber(values.chargePackVoltage),
          packResistance: toNumber(values.chargePackResistance),
          cellVoltage: values.chargeCellVoltages?.map(v => {
            return toNumber(v) || 0;
          }),
          cellResistance: values.chargeCellResistances?.map(r => {
            return toNumber(r) || 0;
          }),
        } as BatteryCharge;
      }
      cycle.excludeFromPlots = values.excludeFromPlots;
      cycle.notes = values.notes;
    });
  };

  const onChangeDischargeCellResistances = (
    result: BatteryCellValuesEditorResult,
  ) => {
    formikRef.current?.setFieldValue(
      'dischargeCellResistances',
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    formikRef.current?.setFieldValue(
      'dischargePackResistance',
      result.packValue.toString(),
    );
  };

  const onChangeDischargeCellVoltages = (
    result: BatteryCellValuesEditorResult,
  ) => {
    formikRef.current?.setFieldValue(
      'dischargeCellVoltages',
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    formikRef.current?.setFieldValue(
      'dischargePackVoltage',
      result.packValue.toString(),
    );
  };

  const onChangeChargeCellResistances = (
    result: BatteryCellValuesEditorResult,
  ) => {
    formikRef.current?.setFieldValue(
      'chargeCellResistances',
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    formikRef.current?.setFieldValue(
      'chargePackResistance',
      result.packValue.toString(),
    );
  };

  const onChangeChargeCellVoltages = (
    result: BatteryCellValuesEditorResult,
  ) => {
    formikRef.current?.setFieldValue(
      'chargeCellVoltages',
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    formikRef.current?.setFieldValue(
      'chargePackVoltage',
      result.packValue.toString(),
    );
  };

  const onDischargeDateChange = (date?: Date) => {
    formikRef.current?.setFieldValue(
      'dischargeDate',
      date ? DateTime.fromJSDate(date).toISO() : DateTime.now().toISO(),
    );
  };

  const onChargeDateChange = (date?: Date) => {
    formikRef.current?.setFieldValue(
      'chargeDate',
      date ? DateTime.fromJSDate(date).toISO() : DateTime.now().toISO(),
    );
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

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={cancel}
          />
        );
      },
      headerRight: () => {
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
      },
    });
  };

  if (!battery) {
    return <EmptyView error message={'Battery Not Found!'} />;
  } else if (!cycle) {
    return <EmptyView error message={'Battery Cycle Not Found!'} />;
  }

  return (
    <>
      <AvoidSoftInputView style={[theme.styles.view]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}>
          <Divider text={'BATTERY'} />
          <ListItem
            title={battery.name}
            subtitle={batterySummary(battery)}
            subtitleLines={2}
            containerStyle={{
              ...s.batteryTint,
              borderLeftColor:
                battery.tint !== BatteryTint.None
                  ? batteryTintIconProps[battery.tint].color
                  : theme.colors.transparent,
            }}
            titleStyle={s.batteryText}
            subtitleStyle={s.batteryText}
            position={['first', 'last']}
            leftContentStyle={{ paddingHorizontal: 0 }}
            leftContent={
              <View>
                {isCharged ? (
                  <BatteryFull
                    color={theme.colors.brandPrimary}
                    style={s.batteryIcon}
                    size={50}
                  />
                ) : (
                  <BatteryLow
                    color={theme.colors.brandPrimary}
                    style={s.batteryIcon}
                    size={50}
                  />
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
            {({ errors, handleChange, setFieldValue, values }) => (
              <View>
                <FormikStateWatcher<FormValues>
                  onChange={onFormikWatcherStateChange}
                />
                <Divider text={'DISCHARGE PHASE'} />
                <ListItemDateTime
                  title={'Date'}
                  value={
                    values.dischargeDate
                      ? DateTime.fromISO(values.dischargeDate).toFormat(
                          "MMM d, yyyy 'at' h:mm a",
                        )
                      : 'Tap to Set...'
                  }
                  pickerValue={values.dischargeDate}
                  expanded={expandedDischargeDate}
                  position={['first']}
                  onPress={() =>
                    setExpandedDischargeDate(!expandedDischargeDate)
                  }
                  onChange={onDischargeDateChange}
                />
                <ListItemInput
                  ref={dischargeDurationRef}
                  title={'Duration'}
                  error={!!errors.dischargeDuration}
                  units={'m:ss'}
                  container={'right'}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: (_, unformatted) =>
                      handleChange('dischargeDuration')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(
                        Fields.dischargeDuration,
                      ),
                    value: values.dischargeDuration,
                    mask: Masks.MINUTES_SECONDS,
                    delimiter: '',
                    rtlNumber: true,
                    placeholder: 'Value',
                    keyboardType: 'number-pad',
                  }}
                />
                <ListItemInput
                  ref={dischargePackVoltageRef}
                  title={'Pack Voltage'}
                  error={!!errors.dischargePackVoltage}
                  units={'V'}
                  container={'right'}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: (_, unformatted) =>
                      handleChange('dischargePackVoltage')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(
                        Fields.dischargePackVoltage,
                      ),
                    value: values.dischargePackVoltage,
                    mask: Masks.VOLTS,
                    delimiter: '',
                    rtlNumber: true,
                    placeholder: 'Value',
                    keyboardType: 'number-pad',
                  }}
                />
                <ListItemInput
                  ref={dischargePackResistanceRef}
                  title={'Pack Resistance'}
                  error={!!errors.dischargePackResistance}
                  units={'mΩ'}
                  container={'right'}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: (_, unformatted) =>
                      handleChange('dischargePackResistance')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(
                        Fields.dischargePackResistance,
                      ),
                    value: values.dischargePackResistance,
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
                      },
                      packValue: values.dischargePackVoltage
                        ? parseFloat(values.dischargePackVoltage)
                        : 0,
                      cellValues: values.dischargeCellVoltages?.map(v => {
                        return toNumber(v) || 0;
                      }),
                      sCells: battery.sCells,
                      pCells: battery.pCells,
                      eventName: 'battery-discharge-cell-voltages',
                    })
                  }
                />
                <ListItem
                  title={'Cell Resistance'}
                  rightContent={'chevron-right'}
                  position={['last']}
                  onPress={() =>
                    navigation.navigate('BatteryCellValuesEditor', {
                      config: {
                        name: 'resistance',
                        namePlural: 'resistances',
                        units: 'mΩ',
                        mask: Masks.OHMS,
                      },
                      packValue: values.dischargePackResistance
                        ? parseFloat(values.dischargePackResistance)
                        : 0,
                      cellValues: values.dischargeCellResistances?.map(r => {
                        return toNumber(r) || 0;
                      }),
                      sCells: battery.sCells,
                      pCells: battery.pCells,
                      eventName: 'battery-discharge-cell-resistances',
                    })
                  }
                />
                {cycle.charge && (
                  <>
                    <Divider text={'CHARGE PHASE'} />
                    <ListItemDateTime
                      title={'Date'}
                      value={
                        values.chargeDate
                          ? DateTime.fromISO(values.chargeDate).toFormat(
                              "MMM d, yyyy 'at' h:mm a",
                            )
                          : 'Tap to Set...'
                      }
                      pickerValue={values.chargeDate}
                      expanded={expandedChargeDate}
                      position={['first']}
                      onPress={() => setExpandedChargeDate(!expandedChargeDate)}
                      onChange={onChargeDateChange}
                    />
                    <ListItemInput
                      ref={chargeAmountRef}
                      title={'Amount'}
                      error={!!errors.chargeAmount}
                      units={'mAh'}
                      container={'right'}
                      inputProps={{
                        inputAccessoryViewID: 'keyboardAccessory',
                        onChangeText: (_, unformatted) =>
                          handleChange('chargeAmount')(unformatted),
                        onFocus: () =>
                          keyboardAccessory.current?.focusedField(
                            Fields.chargeAmount,
                          ),
                        value: values.chargeAmount,
                        mask: Masks.MAH,
                        delimiter: '',
                        rtlNumber: true,
                        placeholder: 'Value',
                        keyboardType: 'number-pad',
                      }}
                    />
                    <ListItem
                      title={'Percent of Capacity'}
                      value={
                        values.chargeAmount && battery.capacity
                          ? values.chargeAmount &&
                            `${((parseFloat(values.chargeAmount) / battery.capacity) * 100).toFixed(1)}%`
                          : '0.0%'
                      }
                    />
                    <ListItemInput
                      ref={chargePackVoltageRef}
                      title={'Pack Voltage'}
                      error={!!errors.chargePackVoltage}
                      units={'V'}
                      container={'right'}
                      inputProps={{
                        inputAccessoryViewID: 'keyboardAccessory',
                        onChangeText: (_, unformatted) =>
                          handleChange('chargePackVoltage')(unformatted),
                        onFocus: () =>
                          keyboardAccessory.current?.focusedField(
                            Fields.chargePackVoltage,
                          ),
                        value: values.chargePackVoltage,
                        mask: Masks.VOLTS,
                        delimiter: '',
                        rtlNumber: true,
                        placeholder: 'Value',
                        keyboardType: 'number-pad',
                      }}
                    />
                    <ListItemInput
                      ref={chargePackResistanceRef}
                      title={'Pack Resistance'}
                      error={!!errors.chargePackResistance}
                      units={'mΩ'}
                      container={'right'}
                      inputProps={{
                        inputAccessoryViewID: 'keyboardAccessory',
                        onChangeText: (_, unformatted) =>
                          handleChange('chargePackResistance')(unformatted),
                        onFocus: () =>
                          keyboardAccessory.current?.focusedField(
                            Fields.chargePackResistance,
                          ),
                        value: values.chargePackResistance,
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
                          },
                          packValue: values.chargePackVoltage
                            ? parseFloat(values.chargePackVoltage)
                            : 0,
                          cellValues: values.chargeCellVoltages?.map(v => {
                            return toNumber(v) || 0;
                          }),
                          sCells: battery.sCells,
                          pCells: battery.pCells,
                          eventName: 'battery-charge-cell-voltages',
                        })
                      }
                    />
                    <ListItem
                      title={'Cell Resistance'}
                      rightContent={'chevron-right'}
                      position={['last']}
                      onPress={() =>
                        navigation.navigate('BatteryCellValuesEditor', {
                          config: {
                            name: 'resistance',
                            namePlural: 'resistances',
                            units: 'mΩ',
                            mask: Masks.OHMS,
                          },
                          packValue: values.chargePackResistance
                            ? parseFloat(values.chargePackResistance)
                            : 0,
                          cellValues: values.chargeCellResistances?.map(r => {
                            return toNumber(r) || 0;
                          }),
                          sCells: battery.sCells,
                          pCells: battery.pCells,
                          eventName: 'battery-charge-cell-resistances',
                        })
                      }
                    />
                  </>
                )}
                <Divider text={'CYCLE STATISTICS'} />
                {cycle.charge && (
                  <>
                    <ListItem
                      title={'Energy per Minute'}
                      value={
                        <View style={s.valueContainer}>
                          <Text style={s.value}>
                            {batteryCycleStats?.value.averageDischargeCurrent?.toFixed()}
                          </Text>
                          <Text style={s.units}>{' mAh'}</Text>
                        </View>
                      }
                      position={['first']}
                    />
                    <ListItem
                      title={'Time to 80%'}
                      value={
                        <View style={s.valueContainer}>
                          <Text style={s.value}>
                            {secondsToFormat(
                              batteryCycleStats?.value.dischargeBy80Percent,
                              {
                                format: "m'm' s's'",
                              },
                            )}
                          </Text>
                        </View>
                      }
                    />
                  </>
                )}
                <ListItemSwitch
                  title={'Exclude Cycle from Plots'}
                  value={values.excludeFromPlots}
                  position={cycle.charge ? ['last'] : ['first', 'last']}
                  onValueChange={value =>
                    setFieldValue('excludeFromPlots', value)
                  }
                />
                <Divider text={'NOTES'} />
                <ListItemNotes
                  notes={values.notes}
                  position={['first', 'last']}
                  onPress={() =>
                    navigation.navigate('NotesEditor', {
                      title: 'Cycle Notes',
                      text: values.notes,
                      eventName: 'battery-cycle-notes',
                    })
                  }
                />
              </View>
            )}
          </Formik>
          <Divider />
        </ScrollView>
      </AvoidSoftInputView>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={resolvedRefs}
        doneText={'Save'}
        disabledDone={!formikCanSubmit}
        onDone={save}
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
  required: {
    color: theme.colors.assertive,
  },
  valueContainer: {
    flexDirection: 'row',
  },
  value: {
    ...theme.text.normal,
  },
  units: {
    ...theme.text.normal,
    color: theme.colors.listItemValue,
  },
}));

export default BatteryCycleEditorScreen;
