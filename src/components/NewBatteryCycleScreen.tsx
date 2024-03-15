import { AppTheme, useTheme } from 'theme';
import { BatteryCharge, BatteryCycle } from 'realmdb/BatteryCycle';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';
import { ListItem, ListItemInput, ListItemSegmented, ListItemSwitch, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
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
import { batteryTintIcons } from 'lib/battery';
import { makeStyles } from '@rneui/themed';
import { toNumber } from 'realmdb/helpers';
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
};

export type Props = NativeStackScreenProps<NewBatteryCycleNavigatorParamList, 'NewBatteryCycle'>;

const NewBatteryCycleScreen = ({ navigation, route }: Props) => {
  const { batteryIds } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();
  const realm = useRealm();

  const ids = batteryIds.map(id => new BSON.ObjectId(id));
  const allBatteries = useQuery(Battery, batteries => { return batteries.filtered('_id IN $0', ids) });

  let sumAllBatteriesCapacity = 0;
  allBatteries.forEach(b => {
    sumAllBatteriesCapacity += b.capacity!;
  });

  const batteryData = allBatteries.map(battery => {
    return {
      battery,
      lastCycle: battery.cycles[battery.cycles.length - 1],
      isCharged: battery.cycles[battery.cycles.length - 1]?.charge || !battery.cycles.length,
      capacityContribution: battery.capacity! / sumAllBatteriesCapacity,
    } as BatteryData;
  });

  // If any single battery has no cycles then force discharge.
  const mustDischarge = allBatteries.some(b => b.cycles.length === 0);

  // If any single battery has charge recommend discharge.
  const shouldDischarge = batteryData.some(d => !!d.lastCycle?.charge);
  const initialAction = mustDischarge || shouldDischarge ? Action.Discharge : Action.Charge;

  //same values for all batteries
  const [date, _setDate] = useState(DateTime.now().toISO()!);
  const [amount, setAmount] = useState<string>('0');
  const [duration, setDuration] = useState<string>('0');
  const [packVoltage, setPackVoltage] = useState<string>('0');
  const [packResistance, setPackResistance] = useState<string>('0');

  // In order to use cell voltages and resistances cell configuration must match for all batteries.
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  const battery = batteryData[0].battery; // Choose any battery for comparison
  const canUseCellValues = batteryData.every(d =>
    d.battery.sCells === battery.sCells &&
    d.battery.pCells === battery.pCells
  );

  const [cellVoltages, setCellVoltages] = useState<string[]>(
    battery ? new Array(battery.sCells * battery.pCells).fill('0') : []
  );
  const [cellResistances, setCellResistances] = useState<string[]>(
    battery ? new Array(battery.sCells * battery.pCells).fill('0') : []
  );
  const [chargeForStorage, setChargeForStorage] = useState(false);
  const [dischargeForStorage, setDischargeForStorage] = useState(false);
  const [excludeFromPlots, setExcludeFromPlots] = useState(false);
  const [notes, setNotes] = useState<string | undefined>(undefined);

  const [action, setAction] = useState<Action>(initialAction);

  useEffect(() => {
    if (!battery) return;

    let canSave = action === Action.Discharge ? parseFloat(duration) > 0 : parseFloat(amount) > 0;

    const save = () => {
      realm.write(() => {
        batteryData.forEach(d => {
          const battery = d.battery;
          const lastCycle = d.lastCycle;
          const capacityContribution = d.capacityContribution;

          // A discharge action results in creating or updating an existing cycle with the discharge phase.
          if (action === Action.Discharge) {

            // If the battery last cycle has a discharge phase but no charge phase then the current
            // discharge phase updates the existing discharge phase using the following rules.
            //  - New duration in this discharge phase is added to the last cycle discharge phase duration.
            //  - The date of the first discharge phase is retained.
            //  - All other values in this discharge phase overwrite last cycle discharge phase values.
            let cycleNumber =  battery.totalCycles ? battery.totalCycles + 1 : 1;

            let newDuration = MSSToSeconds(duration);
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
                packVoltage: toNumber(packVoltage),
                packResistance: toNumber(packResistance),
                cellVoltage: cellVoltages?.map(v => {return parseFloat(v)}),
                cellResistance: cellResistances?.map(r => {return parseFloat(r)}),
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
              let newAmount = toNumber(amount)! * capacityContribution;
              if (lastCycle.charge) {
                newAmount = newAmount + lastCycle.charge.amount!;
              }

              const charge = {
                date,
                amount: newAmount,
                packVoltage: toNumber(packVoltage),
                packResistance: toNumber(packResistance),
                cellVoltage: cellVoltages?.map(v => {return toNumber(v) || 0}),
                cellResistance: cellResistances?.map(r => {return toNumber(r) || 0}),
              } as BatteryCharge;

              // Update the battery with cycle data.
              battery.cycles[battery.cycles.length - 1].charge = charge;
              battery.cycles[battery.cycles.length - 1].excludeFromPlots = excludeFromPlots;
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

    setScreenEditHeader({enabled: canSave, action: onDone});
  }, [
    amount,
    cellVoltages,
    cellResistances,
    excludeFromPlots,
    duration,
    packResistance,
    packVoltage,
    notes,
   ]);
  
  useEffect(() => {
    event.on('battery-cycle-cell-resistances', onChangeCellResistances);
    event.on('battery-cycle-cell-voltages', onChangeCellVoltages);
    event.on('battery-cycle-notes', onChangeNotes);
    return () => {
      event.removeListener('battery-cycle-cell-resistances', onChangeCellResistances);
      event.removeListener('battery-cycle-cell-voltages', onChangeCellVoltages);
      event.removeListener('battery-cycle-notes', onChangeNotes);
    };
  }, []);

  const onChangeCellResistances = (result: BatteryCellValuesEditorResult) => {
    setCellResistances(result.cellValues.map(v => {return v.toString()}));
    setPackResistance(result.packValue.toString());
  };

  const onChangeCellVoltages = (result: BatteryCellValuesEditorResult) => {
    setCellVoltages(result.cellValues.map(v => {return v.toString()}));
    setPackVoltage(result.packValue.toString());
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
          borderLeftColor: battery.tint !== BatteryTint.None ? batteryTintIcons[battery.tint]?.color : theme.colors.transparent,
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
    return (<EmptyView error message={'Battery not found!'} />);
  };

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
      containerStyle={{backgroundColor: theme.colors.transparent}}
      segmentBackgroundColor={theme.colors.hintGray}
      fullWidth={true}
      index={initialAction}
      disabled={mustDischarge}
      position={['first', 'last']}
      onChangeIndex={index => setAction(index)}
    />
    {action === Action.Charge &&
      <>
        <ListItemInput
          title={'Amount'}
          value={parseFloat(amount) > 0 ? amount : undefined}
          titleStyle={parseFloat(amount) === 0 ? s.required : {}}
          placeholder={'Value'}
          label={'mAh'}
          numeric={true}
          numericProps={{prefix: '', delimiter: '', precision: 0, maxValue: 99999}}
          position={['first']}
          onChangeText={setAmount}
        />
        <ListItem
          title={'Percent of Capacity'}
          value={`${battery.capacity ? (parseFloat(amount) / battery.capacity * 100).toFixed(1) : '0.0'}%`}
          rightImage={false}
        />
      </>
    }
    {action === Action.Discharge &&
      <ListItemInput
        title={'Duration'}
        value={parseFloat(duration) > 0 ? duration : undefined}
        titleStyle={parseFloat(duration) === 0 ? s.required : {}}
        placeholder={'Value'}
        label='m:ss'
        numeric={true}
        numericProps={{prefix: '', separator: ':'}}
        keyboardType={'number-pad'}
        position={['first']}
        onChangeText={setDuration}
     />
    }
    <ListItemInput
      title={'Pack Voltage'}
      label={'V'}
      value={parseFloat(packVoltage) > 0 ? packVoltage : undefined}
      placeholder={'Value'}
      numeric={true}
      numericProps={{prefix: ''}}
      onChangeText={setPackVoltage}
    />
    <ListItemInput
      title={'Pack Resistance'}
      label={'mΩ'}
      value={packResistance.length ? packResistance : undefined}
      placeholder={'Value'}
      position={canUseCellValues ? undefined : ['last']}
      numeric={true}
      numericProps={{prefix: '', precision: 3}}
      onChangeText={setPackResistance}
    />
    {canUseCellValues &&
      <>
        <ListItem
          title={'Cell Voltage'}
          onPress={() => navigation.navigate('BatteryCellValuesEditor', {
            config: {name: 'voltage', namePlural: 'voltages', label: 'V', precision: 2},
            packValue: parseFloat(packVoltage),
            cellValues: cellVoltages?.map(v => {return toNumber(v) || 0}),
            sCells: battery.sCells,
            pCells: battery.pCells,
            eventName: 'battery-cycle-cell-voltages',
          })}
        />
        <ListItem
          title={'Cell Resistance'}
          position={['last']}
          onPress={() => navigation.navigate('BatteryCellValuesEditor', {
            config: {name: 'resistance', namePlural: 'resistances', label: 'mΩ', precision: 3},
            packValue: parseFloat(packResistance),
            cellValues: cellResistances?.map(r => {return toNumber(r) || 0}),
            sCells: battery.sCells,
            pCells: battery.pCells,
            eventName: 'battery-cycle-cell-resistances',
          })}
        />
      </>
    }
    <Divider />
    {action === Action.Charge ?
      <ListItemSwitch
        title={'Charge for Storage'}
        value={chargeForStorage}
        position={['first']}
        onValueChange={setChargeForStorage}
      />
      :
      <ListItemSwitch
        title={'Discharge for Storage'}
        value={dischargeForStorage}
        position={['first']}
        onValueChange={setDischargeForStorage}
      />
    }
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
      onPress={() => navigation.navigate('NotesEditor', {
        title: 'Cycle Notes',
        text: notes,
        eventName: 'battery-cycle-notes',
      })}
    />
    <Divider />
  </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  batteryIcon: {
    transform: [{rotate: '-90deg'}],
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
  }
}));

export default NewBatteryCycleScreen;
