import { AppTheme, useTheme } from 'theme';
import { BSON, UpdateMode } from 'realm';
import { ListItem, ListItemInput, ListItemSegmented, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useObject, useRealm } from '@realm/react';

import { Battery } from 'realmdb/Battery';
import { BatteryCellValuesEditorResult } from 'components/BatteryCellValuesEditorScreen';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { BatteryTint } from 'types/battery';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewBatteryCycleNavigatorParamList } from 'types/navigation';
import { batteryTintIcons } from 'lib/battery';
import { makeStyles } from '@rneui/themed';
import { mssToSeconds } from 'lib/formatters';
import { toNumber } from 'realmdb/helpers';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

enum Action {
  Charge = 0,
  Discharge = 1,
};

export type Props = NativeStackScreenProps<NewBatteryCycleNavigatorParamList, 'NewBatteryCycle'>;

const NewBatteryCycleScreen = ({ navigation, route }: Props) => {
  const { batteryId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();

  const battery = useObject(Battery, new BSON.ObjectId(batteryId));

  const mustDischarge = !battery?.lastCycle;
  const initialAction = mustDischarge ? Action.Discharge : Action.Charge;

  const [date, _setDate] = useState(DateTime.now().toISO()!);
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [duration, setDuration] = useState<string | undefined>(undefined);
  const [packVoltage, setPackVoltage] = useState<string>('');
  const [packResistance, setPackResistance] = useState<string>('');
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
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

    let canSave = action === Action.Discharge ? !!duration : !!amount;

    const save = () => {
      realm.write(() => {
        // A discharge action results in creating a new battery cycle.
        if (action === Action.Discharge) {
          const cycleNumber = battery.totalCycles ? battery.totalCycles + 1 : 1;

          // If the battery last cycle has a discharge phase but no charge phase then the current
          // discharge phase updates the existing discharge phase using the following rules.
          //  - New duration in this discharge phase is added to the last cycle discharge phase duration.
          //  - All other values in this discharge phase overwrite last cycle discharge phase values.

          let newDuration = mssToSeconds(toNumber(duration)!);
          if (battery.lastCycle?.discharge && !battery.lastCycle?.charge) {
            newDuration = newDuration + battery.lastCycle.discharge.duration;
          }

          const newCycle = realm.create('BatteryCycle', {
            cycleNumber,
            battery,
            excludeFromPlots,
            discharge: {
              date,
              duration: newDuration,
              packVoltage: toNumber(packVoltage),
              packResistance: toNumber(packResistance),
              cellVoltage: cellVoltages?.map(v => {return parseFloat(v)}),
              cellResistance: cellResistances?.map(r => {return parseFloat(r)}),
            },
            notes,
          } as BatteryCycle);

          // Update the battery total cycle count.
          battery.totalCycles = cycleNumber;
          battery.lastCycle = newCycle;
        }

        // A charge action results in updating an existing charge cycle with the charge.
        if (action === Action.Charge) {

          // If the battery last cycle has a charge phase then that charge phase is updated using
          // the following rules.
          //  - New amount in this charge phase is added to the last cycle charge phase amount.
          //  - All other values in this charge phase overwrite last cycle charge phase values.
          if (battery.lastCycle) {

            let newAmount = toNumber(amount)!;
            if (battery.lastCycle.charge) {
              newAmount = newAmount + battery.lastCycle.charge.amount!;
            }

            realm.create('BatteryCycle', {
              ...battery,
              charge: {
                date,
                amount: newAmount,
                packVoltage: toNumber(packVoltage),
                packResistance: toNumber(packResistance),
                cellVoltage: cellVoltages?.map(v => {return toNumber(v) || 0}),
                cellResistance: cellResistances?.map(r => {return toNumber(r) || 0}),
              },
            }, UpdateMode.Modified);
          } else {
            //error there should be a last cycle with a discharge phase
          }
        }
      });
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({visible: canSave, action: onDone});
  }, [
    amount,
    cellVoltages,
    cellResistances,
    excludeFromPlots,
    duration,
    packResistance,
    packVoltage,
   ]);
  
  useEffect(() => {
    event.on('battery-cycle-cell-resistances', onChangeCellResistances);
    event.on('battery-cycle-cell-voltages', onChangeCellVoltages);
    event.on('battery-cycle-notes', setNotes);
    return () => {
      event.removeListener('battery-cycle-cell-resistances', onChangeCellResistances);
      event.removeListener('battery-cycle-cell-voltages', onChangeCellVoltages);
      event.removeListener('battery-cycle-notes', setNotes);
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

  if (!battery) {
    return (<EmptyView error message={'Battery not found!'} />);
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
    <Divider text={'BATTERY'} />
    <ListItem
        title={battery.name}
        subtitle={'1 flight, last Nov 4, 2023\n0:04:00 total time, 4:00 avg time'}
        subtitleNumberOfLines={2}
        containerStyle={{
          ...s.batteryTint,
          borderLeftColor: battery.tint !== BatteryTint.None ? batteryTintIcons[battery.tint]?.color : theme.colors.transparent,
        }}
        titleStyle={s.batteryText}
        subtitleStyle={s.batteryText}
        position={['first', 'last']}
        rightImage={false}
        leftImage={
          <View>
            <Icon
              name={'battery-full'}
              solid={true}
              size={45}
              color={theme.colors.brandPrimary}
              style={s.batteryIcon}
            />
          </View>
        }
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
          value={!amount || !amount.length ? undefined : amount}
          titleStyle={!amount ? s.required : {}}
          placeholder={'Value'}
          label={'mAh'}
          numeric={true}
          numericProps={{prefix: '', delimiter: '', precision: 0, maxValue: 99999}}
          position={['first']}
          onChangeText={setAmount}
        />
        <ListItem
          title={'Percent of Capacity'}
          value={'0.0%'}
          rightImage={false}
        />
      </>
    }
    {action === Action.Discharge &&
      <ListItemInput
        title={'Duration'}
        value={!duration || !duration.length ? undefined : duration}
        titleStyle={!duration ? s.required : {}}
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
      value={!packVoltage || !packVoltage.length ? undefined : packVoltage}
      placeholder={'Value'}
      numeric={true}
      numericProps={{prefix: ''}}
      onChangeText={setPackVoltage}
    />
    <ListItemInput
      title={'Pack Resistance'}
      label={'mΩ'}
      value={!packResistance || !packResistance.length ? undefined : packResistance}
      placeholder={'Value'}
      numeric={true}
      numericProps={{prefix: '', precision: 3}}
      onChangeText={setPackResistance}
    />
    <ListItem
      title={'Cell Voltage'}
      onPress={() => navigation.navigate('BatteryCellValuesEditor', {
        config: {name: 'voltage', namePlural: 'voltages', label: 'V', precision: 2},
        packValue: Number(packVoltage),
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
        packValue: Number(packResistance),
        cellValues: cellResistances?.map(r => {return toNumber(r) || 0}),
        sCells: battery.sCells,
        pCells: battery.pCells,
        eventName: 'battery-cycle-cell-resistances',
      })}
    />
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
      onPress={() => navigation.navigate('Notes', {
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
