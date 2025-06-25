import { AppTheme, useTheme } from 'theme';
import { BatteryCharge, BatteryCycle } from 'realmdb/BatteryCycle';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';
import {
  ListItem,
  ListItemInput,
  ListItemInputMethods,
  ListItemSegmented,
  ListItemSwitch,
  listItemPosition,
} from 'components/atoms/List';
import React, { useEffect, useRef, useState } from 'react';
import { batteryIsCharged, batteryTintIcons } from 'lib/battery';
import { useQuery, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { BatteryCellValuesEditorResult } from 'components/BatteryCellValuesEditorScreen';
import { BatteryTint } from 'types/battery';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { MSSToSeconds } from 'lib/formatters';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewBatteryCycleNavigatorParamList } from 'types/navigation';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { batteryCycleSummary } from 'lib/batteryCycle';
import { makeStyles } from '@rn-vui/themed';
import { toNumber } from 'realmdb/helpers';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

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

export type Props = NativeStackScreenProps<
  NewBatteryCycleNavigatorParamList,
  'NewBatteryCycle'
>;

const NewBatteryCycleScreen = ({ navigation, route }: Props) => {
  const { batteryIds } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const setDebounced = useDebouncedRender();
  const setScreenEditHeader = useScreenEditHeader();
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
  const initialAction =
    mustDischarge || shouldDischarge ? Action.Discharge : Action.Charge;

  //same values for all batteries
  const [date, _setDate] = useState(DateTime.now().toISO());
  const amount = useRef<string>(undefined);
  const duration = useRef<string>(undefined);
  const packVoltage = useRef<string>(undefined);
  const packResistance = useRef<string>(undefined);

  // In order to use cell voltages and resistances cell configuration must match for all batteries.
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  const battery = batteryData[0].battery; // Choose any battery for comparison
  const canUseCellValues = batteryData.every(
    d =>
      d.battery.sCells === battery.sCells &&
      d.battery.pCells === battery.pCells,
  );

  const [cellVoltages, setCellVoltages] = useState<string[]>(
    battery ? new Array(battery.sCells * battery.pCells).fill('0') : [],
  );
  const [cellResistances, setCellResistances] = useState<string[]>(
    battery ? new Array(battery.sCells * battery.pCells).fill('0') : [],
  );
  const [chargeForStorage, setChargeForStorage] = useState(false);
  const [dischargeForStorage, setDischargeForStorage] = useState(false);
  const [excludeFromPlots, setExcludeFromPlots] = useState(false);
  const [notes, setNotes] = useState<string | undefined>(undefined);

  const [action, setAction] = useState<Action>(initialAction);

  const packVoltageRef = useRef<ListItemInputMethods>(null);
  const packResistanceRef = useRef<ListItemInputMethods>(null);

  useEffect(() => {
    if (!battery) return;

    const canSave =
      action === Action.Discharge
        ? duration.current
          ? parseFloat(duration.current) > 0
          : false
        : amount.current
          ? parseFloat(amount.current) > 0
          : false;

    const save = () => {
      realm.write(() => {
        batteryData.forEach(d => {
          const battery = d.battery;
          const lastCycle = d.lastCycle;
          const capacityContribution = d.capacityContribution;

          // A discharge action results in creating or updating an existing cycle with the discharge phase.
          if (action === Action.Discharge) {
            if (!duration.current) return; // Prevent need for assertions.

            // If the battery last cycle has a discharge phase but no charge phase then the current
            // discharge phase updates the existing discharge phase using the following rules.
            //  - New duration in this discharge phase is added to the last cycle discharge phase duration.
            //  - The date of the first discharge phase is retained.
            //  - All other values in this discharge phase overwrite last cycle discharge phase values.
            let cycleNumber = battery.totalCycles ? battery.totalCycles + 1 : 1;

            let newDuration = MSSToSeconds(duration.current);
            let newDate = date;
            let updateLastDischargePhase = false;

            if (lastCycle && lastCycle.discharge && !lastCycle.charge) {
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
                packVoltage: toNumber(packVoltage.current),
                packResistance: toNumber(packResistance.current),
                cellVoltage: cellVoltages?.map(v => {
                  return parseFloat(v);
                }),
                cellResistance: cellResistances?.map(r => {
                  return parseFloat(r);
                }),
              },
              excludeFromPlots,
              notes,
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
          if (action === Action.Charge) {
            // In a parallel cycle the new amount added to the battery charge is in proportion
            // to the battery's percentage contribution across all batteries in the cycle.
            //
            // If the battery last cycle has a charge phase then that charge phase is updated using
            // the following rules.
            //  - New amount in this charge phase is added to the last cycle charge phase amount.
            //  - All other values in this charge phase overwrite last cycle charge phase values.
            if (lastCycle) {
              let newAmount = toNumber(amount.current) * capacityContribution;
              if (lastCycle.charge) {
                newAmount = newAmount + (lastCycle.charge.amount || 0);
              }

              const charge = {
                date,
                amount: newAmount,
                packVoltage: toNumber(packVoltage.current),
                packResistance: toNumber(packResistance.current),
                cellVoltage: cellVoltages?.map(v => {
                  return toNumber(v) || 0;
                }),
                cellResistance: cellResistances?.map(r => {
                  return toNumber(r) || 0;
                }),
              } as BatteryCharge;

              // Update the battery with cycle data.
              battery.cycles[battery.cycles.length - 1].charge = charge;
              battery.cycles[battery.cycles.length - 1].excludeFromPlots =
                excludeFromPlots;
              battery.cycles[battery.cycles.length - 1].notes = notes;
            } else {
              // This is an error (database or logic problem).
              // There should always be a last cycle with a discharge phase.
            }
          }
        });
      });
    };

    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({ enabled: canSave, action: onDone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    amount.current,
    cellVoltages,
    cellResistances,
    excludeFromPlots,
    duration.current,
    packResistance.current,
    packVoltage.current,
    notes,
  ]);

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

  const onChangeAction = (index: number) => {
    setAction(index);
    amount.current = undefined;
    duration.current = undefined;
    packVoltage.current = undefined;
    packResistance.current = undefined;
    packVoltageRef.current?.setValue();
    packResistanceRef.current?.setValue();
  };

  const onChangeCellResistances = (result: BatteryCellValuesEditorResult) => {
    setCellResistances(
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    packResistance.current = result.packValue.toString();
    packResistanceRef.current?.setValue(result.packValue.toString());
  };

  const onChangeCellVoltages = (result: BatteryCellValuesEditorResult) => {
    setCellVoltages(
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    packVoltage.current = result.packValue.toString();
    packVoltageRef.current?.setValue(result.packValue.toString());
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    setNotes(result.text);
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
        subtitleNumberOfLines={2}
        containerStyle={{
          ...s.batteryTint,
          borderLeftColor:
            battery.tint !== BatteryTint.None
              ? batteryTintIcons[battery.tint]?.color
              : theme.colors.transparent,
        }}
        titleStyle={s.batteryText}
        subtitleStyle={s.batteryText}
        position={listItemPosition(index, batteryData.length)}
        rightImage={false}
        leftImage={
          <View>
            <Icon
              name={isCharged ? 'battery-full' : 'battery-quarter'}
              solid={true}
              size={45}
              color={theme.colors.brandPrimary}
              style={s.batteryIcon}
            />
          </View>
        }
      />
    );
  };

  if (!battery) {
    return <EmptyView error message={'Battery not found!'} />;
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={batteryData.length > 1 ? 'BATTERIES' : 'BATTERY'} />
      <FlatList
        data={batteryData}
        renderItem={renderBatteryItem}
        scrollEnabled={false}
      />
      <Divider text={'ACTION'} />
      <ListItemSegmented
        segments={['Charge Action', 'Discharge Action']}
        containerStyle={{ backgroundColor: theme.colors.transparent }}
        segmentBackgroundColor={theme.colors.hintGray}
        fullWidth={true}
        index={initialAction}
        disabled={mustDischarge}
        position={['first', 'last']}
        onChangeIndex={onChangeAction}
      />
      {action === Action.Charge && (
        <>
          <ListItemInput
            title={'Amount'}
            value={
              amount.current && parseFloat(amount.current) > 0
                ? amount.current
                : undefined
            }
            titleStyle={
              !amount.current || parseFloat(amount.current) === 0
                ? s.required
                : {}
            }
            placeholder={'Value'}
            label={'mAh'}
            numeric={true}
            numericProps={{
              prefix: '',
              delimiter: '',
              precision: 0,
              maxValue: 99999,
            }}
            position={['first']}
            onChangeText={value => setDebounced(() => (amount.current = value))}
          />
          <ListItem
            title={'Percent of Capacity'}
            value={
              amount.current && battery.capacity
                ? amount.current &&
                  `${((parseFloat(amount.current) / battery.capacity) * 100).toFixed(1)}%`
                : '0.0%'
            }
            rightImage={false}
          />
        </>
      )}
      {action === Action.Discharge && (
        <ListItemInput
          title={'Duration'}
          value={
            duration.current && parseFloat(duration.current) > 0
              ? duration.current
              : undefined
          }
          titleStyle={
            !duration.current || parseFloat(duration.current) === 0
              ? s.required
              : {}
          }
          placeholder={'Value'}
          label="m:ss"
          numeric={true}
          numericProps={{ prefix: '', separator: ':' }}
          keyboardType={'number-pad'}
          position={['first']}
          onChangeText={value =>
            setDebounced(() => value && (duration.current = value))
          }
        />
      )}
      <ListItemInput
        ref={packVoltageRef}
        title={'Pack Voltage'}
        label={'V'}
        value={
          packVoltage.current && parseFloat(packVoltage.current) > 0
            ? parseFloat(packVoltage.current).toFixed(1)
            : undefined
        }
        placeholder={'Value'}
        numeric={true}
        numericProps={{ prefix: '' }}
        onChangeText={value =>
          setDebounced(() => value && (packVoltage.current = value))
        }
      />
      <ListItemInput
        ref={packResistanceRef}
        title={'Pack Resistance'}
        label={'mΩ'}
        value={
          packResistance.current && parseFloat(packResistance.current) > 0
            ? packResistance.current
            : undefined
        }
        placeholder={'Value'}
        position={canUseCellValues ? undefined : ['last']}
        numeric={true}
        numericProps={{ prefix: '', precision: 3 }}
        onChangeText={value =>
          setDebounced(() => value && (packResistance.current = value))
        }
      />
      {canUseCellValues && (
        <>
          <ListItem
            title={'Cell Voltage'}
            onPress={() =>
              navigation.navigate('BatteryCellValuesEditor', {
                config: {
                  name: 'voltage',
                  namePlural: 'voltages',
                  label: 'V',
                  precision: 2,
                },
                packValue: packVoltage.current
                  ? parseFloat(packVoltage.current)
                  : 0,
                cellValues: cellVoltages?.map(v => {
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
            position={['last']}
            onPress={() =>
              navigation.navigate('BatteryCellValuesEditor', {
                config: {
                  name: 'resistance',
                  namePlural: 'resistances',
                  label: 'mΩ',
                  precision: 3,
                },
                packValue: packResistance.current
                  ? parseFloat(packResistance.current)
                  : 0,
                cellValues: cellResistances?.map(r => {
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
      {action === Action.Charge ? (
        <ListItemSwitch
          title={'Charge for Storage'}
          value={chargeForStorage}
          position={['first']}
          onValueChange={setChargeForStorage}
        />
      ) : (
        <ListItemSwitch
          title={'Discharge for Storage'}
          value={dischargeForStorage}
          position={['first']}
          onValueChange={setDischargeForStorage}
        />
      )}
      <ListItemSwitch
        title={'Exclude Cycle from Plots'}
        value={excludeFromPlots}
        position={['last']}
        onValueChange={setExcludeFromPlots}
      />
      <Divider />
      <ListItem
        title={notes || 'Notes'}
        position={['first', 'last']}
        onPress={() =>
          navigation.navigate('NotesEditor', {
            title: 'Cycle Notes',
            text: notes,
            eventName: 'battery-cycle-notes',
          })
        }
      />
      <Divider />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  batteryIcon: {
    transform: [{ rotate: '-90deg' }],
    width: '100%',
    left: -8,
  },
  batteryText: {
    left: 15,
    maxWidth: '90%',
  },
  batteryTint: {
    borderLeftWidth: 8,
  },
  required: {
    color: theme.colors.assertive,
  },
}));

export default NewBatteryCycleScreen;
