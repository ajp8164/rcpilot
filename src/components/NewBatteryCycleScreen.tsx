import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  ListRenderItem,
  ScrollView,
  View,
} from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItem,
  ListItemInputMethods,
  ListItemSegmented,
  ListItemSwitch,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { BatteryCellValuesEditorResult } from 'components/BatteryCellValuesEditorScreen';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemNotes } from 'components/atoms/List';
import { EmptyView } from 'components/molecules/EmptyView';
import { Formik, FormikProps } from 'formik';
import { batteryIsCharged, batteryTintIconProps } from 'lib/battery';
import { batteryCycleSummary } from 'lib/batteryCycle';
import { MSSToSeconds } from 'lib/formatters';
import { Masks } from 'lib/inputMasks';
import { BatteryFull, BatteryLow } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { BatteryCharge, BatteryCycle } from 'realmdb/BatteryCycle';
import { toNumber } from 'realmdb/helpers';
import { BatteryTint } from 'types/battery';
import { NewBatteryCycleNavigatorParamList } from 'types/navigation';
import * as Yup from 'yup';

type BatteryData = {
  battery: Battery;
  lastCycle: BatteryCycle;
  isCharged: boolean;
  capacityContribution: number;
};

enum Action {
  Charge = 0,
  Discharge = 1,
}

// Order of fields for accessory view.
enum Fields {
  amount,
  duration,
  packVoltage,
  packResistance,
}

type FormValues = {
  action: Action;
  amount: string;
  duration: string;
  packVoltage: string;
  packResistance: string;
  cellVoltages: string[];
  cellResistances: string[];
  chargeForStorage: boolean;
  dischargeForStorage: boolean;
  excludeFromPlots: boolean;
  notes: string;
};

export type Props = NativeStackScreenProps<
  NewBatteryCycleNavigatorParamList,
  'NewBatteryCycle'
>;

const NewBatteryCycleScreen = ({ navigation, route }: Props) => {
  const { batteryIds } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const event = useEvent();
  const realm = useRealm();

  const ids = batteryIds.map(id => new BSON.ObjectId(id));
  const allBatteries = useQuery(Battery, batteries => {
    return batteries.filtered('_id IN $0', ids);
  });

  let sumAllBatteriesCapacity = 0;
  allBatteries.forEach(b => {
    sumAllBatteriesCapacity += b.capacity ? b.capacity : 0;
  });

  const batteryData = allBatteries.map(battery => {
    return {
      battery,
      lastCycle: battery.cycles[battery.cycles.length - 1],
      isCharged: batteryIsCharged(battery),
      capacityContribution: battery.capacity
        ? battery.capacity / sumAllBatteriesCapacity
        : 0,
    } as BatteryData;
  });

  // If any single battery has no cycles then force discharge.
  const mustDischarge = allBatteries.some(b => b.cycles.length === 0);

  // If any single battery has charge recommend discharge.
  const shouldDischarge = batteryData.some(d => !!d.lastCycle?.charge);

  // In order to use cell voltages and resistances cell configuration must match for all batteries.
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  const battery = batteryData[0].battery; // Choose any battery for comparison
  const canUseCellValues = batteryData.every(
    d =>
      d.battery.sCells === battery.sCells &&
      d.battery.pCells === battery.pCells,
  );

  const initialValues = {
    action: mustDischarge || shouldDischarge ? Action.Discharge : Action.Charge,
    amount: battery?.capacity?.toFixed() || '',
    duration: '',
    packVoltage: '',
    packResistance: '',
    cellVoltages: battery
      ? new Array(battery.sCells * battery.pCells).fill('0')
      : [],
    cellResistances: battery
      ? new Array(battery.sCells * battery.pCells).fill('0')
      : [],
    chargeForStorage: false,
    dischargeForStorage: false,
    excludeFromPlots: false,
    notes: '',
  } as FormValues;

  const schema = Yup.object().shape({
    action: Yup.number(),
    amount: Yup.string().when('action', {
      is: Action.Charge,
      then: Yup.string().required(),
      otherwise: Yup.string(),
    }),
    duration: Yup.string().when('action', {
      is: Action.Discharge,
      then: Yup.string().required(),
      otherwise: Yup.string(),
    }),
    packVoltage: Yup.string(),
    packResistance: Yup.string(),
    cellVoltages: Yup.array().of(Yup.string()),
    cellResistances: Yup.array().of(Yup.string()),
    chargeForStorage: Yup.boolean(),
    dischargeForStorage: Yup.boolean(),
    excludeFromPlots: Yup.boolean(),
    notes: Yup.string(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const amountFieldRef = useRef<ListItemInputMethods>(null);
  const durationFieldRef = useRef<ListItemInputMethods>(null);
  const packVoltageFieldRef = useRef<ListItemInputMethods>(null);
  const packResistanceFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [
        amountFieldRef.current,
        durationFieldRef.current,
        packVoltageFieldRef.current,
        packResistanceFieldRef.current,
      ].filter(Boolean),
    );
  }, []);

  useEffect(() => {
    event.on('battery-cycle-cell-resistances', onChangeCellResistances);
    event.on('battery-cycle-cell-voltages', onChangeCellVoltages);
    event.on('battery-cycle-notes', onChangeNotes);
    return () => {
      event.removeListener(
        'battery-cycle-cell-resistances',
        onChangeCellResistances,
      );
      event.removeListener('battery-cycle-cell-voltages', onChangeCellVoltages);
      event.removeListener('battery-cycle-notes', onChangeNotes);
    };
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
    const now = DateTime.now().toISO();

    realm.write(() => {
      batteryData.forEach(d => {
        const battery = d.battery;
        const lastCycle = d.lastCycle;
        const capacityContribution = d.capacityContribution;

        // A discharge action results in creating or updating an existing cycle with the discharge phase.
        if (values.action === Action.Discharge) {
          if (!values.duration) return; // Prevent need for assertions.

          // If the battery last cycle has a discharge phase but no charge phase then the current
          // discharge phase updates the existing discharge phase using the following rules.
          //  - New duration in this discharge phase is added to the last cycle discharge phase duration.
          //  - The date of the first discharge phase is retained.
          //  - All other values in this discharge phase overwrite last cycle discharge phase values.
          let cycleNumber = battery.totalCycles ? battery.totalCycles + 1 : 1;

          let newDuration = MSSToSeconds(values.duration);
          let newDate = now;
          let updateLastDischargePhase = false;

          if (lastCycle?.discharge && !lastCycle.charge) {
            newDuration = newDuration + lastCycle.discharge.duration;
            newDate = lastCycle.discharge.date;
            cycleNumber = lastCycle.cycleNumber;
            updateLastDischargePhase = true;
          }

          const newCycle = realm.create('BatteryCycle', {
            cycleNumber,
            battery,
            discharge: {
              date: newDate,
              duration: newDuration,
              packVoltage: toNumber(values.packVoltage),
              packResistance: toNumber(values.packResistance),
              cellVoltage: values.cellVoltages?.map(v => {
                return parseFloat(v);
              }),
              cellResistance: values.cellResistances?.map(r => {
                return parseFloat(r);
              }),
            },
            excludeFromPlots: values.excludeFromPlots,
            notes: values.notes,
          } as BatteryCycle);

          // Update the battery with cycle data.
          if (updateLastDischargePhase) {
            battery.cycles[battery.cycles.length - 1] = newCycle;
          } else {
            battery.cycles.push(newCycle);
          }

          // Total cycles is tracked on the battery to enable a new battery to be created
          // with some number of unlogged cycles.
          battery.totalCycles = cycleNumber;
        }

        // A charge action results in updating an existing cycle with the charge phase.
        if (values.action === Action.Charge) {
          // In a parallel cycle the new amount added to the battery charge is in proportion
          // to the battery's percentage contribution across all batteries in the cycle.
          //
          // If the battery last cycle has a charge phase then that charge phase is updated using
          // the following rules.
          //  - New amount in this charge phase is added to the last cycle charge phase amount.
          //  - All other values in this charge phase overwrite last cycle charge phase values.
          if (lastCycle) {
            let newAmount = toNumber(values.amount) * capacityContribution;
            if (lastCycle.charge) {
              newAmount = newAmount + (lastCycle.charge.amount || 0);
            }

            const charge = {
              date: now,
              amount: newAmount,
              packVoltage: toNumber(values.packVoltage),
              packResistance: toNumber(values.packResistance),
              cellVoltage: values.cellVoltages?.map(v => {
                return toNumber(v) || 0;
              }),
              cellResistance: values.cellResistances?.map(r => {
                return toNumber(r) || 0;
              }),
            } as BatteryCharge;

            // Update the battery with cycle data.
            battery.cycles[battery.cycles.length - 1].charge = charge;
            battery.cycles[battery.cycles.length - 1].excludeFromPlots =
              values.excludeFromPlots;
            battery.cycles[battery.cycles.length - 1].notes = values.notes;
          } else {
            // This is an error (database or logic problem).
            // There should always be a last cycle with a discharge phase.
          }
        }
      });
    });
  };

  const onChangeAction = (index: number) => {
    formikRef.current?.setFieldValue('action', index);
    formikRef.current?.setFieldValue(
      'amount',
      !formikRef.current?.values.amount
        ? battery?.capacity?.toFixed() || ''
        : formikRef.current?.values.amount,
    );
    formikRef.current?.setFieldValue('duration', '');
    formikRef.current?.setFieldValue('packVoltage', '');
    formikRef.current?.setFieldValue('packResistance', '');
    formikRef.current?.setFieldValue('cellVoltages', []);
    formikRef.current?.setFieldValue('cellResistances', []);
    requestAnimationFrame(() => formikRef.current?.validateForm());
  };

  const onChangeCellResistances = (result: BatteryCellValuesEditorResult) => {
    formikRef.current?.setFieldValue(
      'cellResistances',
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    formikRef.current?.setFieldValue(
      'packResistance',
      result.packValue.toString(),
    );
  };

  const onChangeCellVoltages = (result: BatteryCellValuesEditorResult) => {
    formikRef.current?.setFieldValue(
      'cellVoltages',
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    formikRef.current?.setFieldValue(
      'packVoltage',
      result.packValue.toString(),
    );
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    formikRef.current?.setFieldValue('notes', result.text);
  };

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false, init } = state;

    // Checking init enables a charge form to be immediatley submitted since the amount is prefilled.
    const canSubmit = (next.dirty || init) && isValid;
    setFormikCanSubmit(canSubmit);

    navigation.setOptions({
      title: battery ? 'Battery' : 'New Battery',
    });

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

  const renderBatteryItem: ListRenderItem<BatteryData> = ({
    item: batteryDataItem,
    index,
  }) => {
    const battery = batteryDataItem.battery;
    const isCharged = batteryDataItem.isCharged;
    return (
      <ListItem
        title={battery.name}
        subtitle={batteryCycleSummary(battery)}
        subtitleLines={2}
        position={listItemPosition(index, batteryData.length)}
        containerStyle={{
          ...s.batteryTint,
          borderLeftColor:
            battery.tint !== BatteryTint.None
              ? batteryTintIconProps[battery.tint]?.color
              : theme.colors.transparent,
        }}
        leftContent={
          isCharged ? (
            <BatteryFull
              color={theme.colors.brandPrimary}
              size={50}
              style={{ transform: [{ rotate: '-90deg' }] }}
            />
          ) : (
            <BatteryLow
              color={theme.colors.brandPrimary}
              size={50}
              style={{ transform: [{ rotate: '-90deg' }] }}
            />
          )
        }
      />
    );
  };

  if (!battery) {
    return <EmptyView error message={'Battery not found!'} />;
  }

  return (
    <>
      <AvoidSoftInputView style={[theme.styles.view]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}>
          <Divider text={batteryData.length > 1 ? 'BATTERIES' : 'BATTERY'} />
          <FlatList
            data={batteryData}
            renderItem={renderBatteryItem}
            scrollEnabled={false}
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
                <Divider text={'ACTION'} />
                <ListItemSegmented
                  segments={['Charge Action', 'Discharge Action']}
                  containerStyle={{ backgroundColor: theme.colors.transparent }}
                  segmentBackgroundColor={theme.colors.hintGray}
                  fullWidth={true}
                  index={values.action}
                  disabled={mustDischarge}
                  position={['first', 'last']}
                  onChangeIndex={onChangeAction}
                />
                {values.action === Action.Charge && (
                  <>
                    <ListItemInput
                      ref={amountFieldRef}
                      title={'Amount'}
                      position={['first']}
                      error={!!errors.amount}
                      units={'mAh'}
                      container={'right'}
                      inputProps={{
                        inputAccessoryViewID: 'keyboardAccessory',
                        onChangeText: (_, unformatted) =>
                          handleChange('amount')(unformatted),
                        onFocus: () =>
                          keyboardAccessory.current?.focusedField(
                            Fields.amount,
                          ),
                        value: values.amount,
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
                        values.amount && battery.capacity
                          ? values.amount &&
                            `${((parseFloat(values.amount) / battery.capacity) * 100).toFixed(1)}%`
                          : '0.0%'
                      }
                    />
                  </>
                )}
                {values.action === Action.Discharge && (
                  <ListItemInput
                    ref={amountFieldRef}
                    title={'Duration'}
                    position={['first']}
                    error={!!errors.duration}
                    units={'m:ss'}
                    container={'right'}
                    inputProps={{
                      inputAccessoryViewID: 'keyboardAccessory',
                      onChangeText: (_, unformatted) =>
                        handleChange('duration')(unformatted),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(
                          Fields.duration,
                        ),
                      value: values.duration,
                      mask: Masks.MINUTES_SECONDS,
                      rtlNumber: true,
                      placeholder: 'Value',
                      keyboardType: 'number-pad',
                    }}
                  />
                )}
                <ListItemInput
                  ref={packVoltageFieldRef}
                  title={'Pack Voltage'}
                  error={!!errors.packVoltage}
                  units={'V'}
                  container={'right'}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: (_, unformatted) =>
                      handleChange('packVoltage')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(
                        Fields.packVoltage,
                      ),
                    value: values.packVoltage,
                    mask: Masks.VOLTS,
                    rtlNumber: true,
                    placeholder: 'Value',
                    keyboardType: 'number-pad',
                  }}
                />
                <ListItemInput
                  ref={packResistanceFieldRef}
                  title={'Pack Resistance'}
                  error={!!errors.packResistance}
                  units={'mΩ'}
                  container={'right'}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: (_, unformatted) =>
                      handleChange('packResistance')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(
                        Fields.packResistance,
                      ),
                    value: values.packResistance,
                    mask: Masks.OHMS,
                    rtlNumber: true,
                    placeholder: 'Value',
                    keyboardType: 'number-pad',
                  }}
                />
                {canUseCellValues && (
                  <>
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
                          packValue: values.packVoltage
                            ? parseFloat(values.packVoltage)
                            : 0,
                          cellValues: values.cellVoltages?.map(v => {
                            return toNumber(v) || 0;
                          }),
                          sCells: battery.sCells,
                          pCells: battery.pCells,
                          eventName: 'battery-cycle-cell-voltages',
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
                          packValue: values.packResistance
                            ? parseFloat(values.packResistance)
                            : 0,
                          cellValues: values.cellResistances?.map(r => {
                            return toNumber(r) || 0;
                          }),
                          sCells: battery.sCells,
                          pCells: battery.pCells,
                          eventName: 'battery-cycle-cell-resistances',
                        })
                      }
                    />
                  </>
                )}
                <Divider />
                {values.action === Action.Charge ? (
                  <ListItemSwitch
                    title={'Charge for Storage'}
                    value={values.chargeForStorage}
                    position={['first']}
                    onValueChange={value =>
                      setFieldValue('chargeForStorage', value)
                    }
                  />
                ) : (
                  <ListItemSwitch
                    title={'Discharge for Storage'}
                    value={values.dischargeForStorage}
                    position={['first']}
                    onValueChange={value =>
                      setFieldValue('dischargeForStorage', value)
                    }
                  />
                )}
                <ListItemSwitch
                  title={'Exclude Cycle from Plots'}
                  value={values.excludeFromPlots}
                  position={['last']}
                  onValueChange={value =>
                    setFieldValue('excludeFromPlots', value)
                  }
                />
                <Divider />
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

const useStyles = ThemeManager.createStyleSheet(() => ({
  batteryTint: {
    borderLeftWidth: 8,
  },
}));

export default NewBatteryCycleScreen;
