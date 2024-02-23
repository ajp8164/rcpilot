import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemDate, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import { MSSToSeconds, secondsToMSS } from 'lib/formatters';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { eqArray, eqBoolean, eqNumber, eqString, toNumber } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { BatteriesNavigatorParamList } from 'types/navigation';
import { Battery } from 'realmdb/Battery';
import { BatteryCellValuesEditorResult } from 'components/BatteryCellValuesEditorScreen';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { BatteryTint } from 'types/battery';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { batteryTintIcons } from 'lib/battery';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryCycleEditor'>;

const BatteryCycleEditorScreen = ({ navigation, route }: Props) => {
  const { batteryId, cycleNumber } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));
  const cycle = battery?.cycles.find(c => {return c.cycleNumber === cycleNumber});
  const isCharged = battery?.cycles[battery.cycles.length - 1]?.charge || !battery?.cycles.length;

  // Discharge phase
  const [dischargeDate, setDischargeDate] = useState(cycle?.discharge?.date);
  const [dischargeDuration, setDischargeDuration] = useState(secondsToMSS(cycle?.discharge?.duration) || undefined);
  const [dischargePackVoltage, setDischargePackVoltage] = useState(cycle?.discharge?.packVoltage?.toString() || undefined);
  const [dischargePackResistance, setDischargePackResistance] = useState(cycle?.discharge?.packResistance?.toString() || undefined);
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  const [dischargeCellVoltages, setDischargeCellVoltages] = useState<string[]>(
    cycle?.discharge?.cellVoltage ||
    (battery ? new Array(battery.sCells * battery.pCells).fill('0') : [])
  );
  const [dischargeCellResistances, setDischargeCellResistances] = useState<string[]>(
    cycle?.discharge?.cellResistance ||
    (battery ? new Array(battery.sCells * battery.pCells).fill('0') : [])
  );

  // Charge phase
  const [chargeDate, setChargeDate] = useState(cycle?.charge?.date);
  const [chargeAmount, setChargeAmount] = useState(cycle?.charge?.amount?.toString() || undefined);
  const [chargePackVoltage, setChargePackVoltage] = useState(cycle?.charge?.packVoltage?.toString() || undefined);
  const [chargePackResistance, setChargePackResistance] = useState(cycle?.charge?.packResistance?.toString() || undefined);
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  const [chargeCellVoltages, setChargeCellVoltages] = useState<string[]>(
    cycle?.charge?.cellVoltage ||
    (battery ? new Array(battery.sCells * battery.pCells).fill('0') : [])
  );
  const [chargeCellResistances, setChargeCellResistances] = useState<string[]>(
    cycle?.charge?.cellResistance ||
    (battery ? new Array(battery.sCells * battery.pCells).fill('0') : [])
  );
  const [excludeFromPlots, setExcludeFromPlots] = useState(false);
  const [notes, setNotes] = useState<string | undefined>(undefined);

  const [expandedDischargeDate, setExpandedDischargeDate] = useState(false);
  const [expandedChargeDate, setExpandedChargeDate] = useState(false);

  useEffect(() => {
    if (!battery || !cycle) return;

    const canSave = !!dischargeDuration && !!chargeAmount && (
      !eqString(cycle.discharge?.date, dischargeDate) ||
      !eqNumber(cycle.discharge?.duration, MSSToSeconds(dischargeDuration).toString()) ||
      !eqNumber(cycle.discharge?.packVoltage, dischargePackVoltage) ||
      !eqNumber(cycle.discharge?.packResistance, dischargePackResistance) ||
      !eqArray(cycle.discharge?.cellVoltage, dischargeCellVoltages) ||
      !eqArray(cycle.discharge?.cellResistance, dischargeCellResistances) ||
      !eqString(cycle.charge?.date, chargeDate) ||
      !eqNumber(cycle.charge?.amount, chargeAmount) ||
      !eqNumber(cycle.charge?.packVoltage, chargePackVoltage) ||
      !eqNumber(cycle.charge?.packResistance, chargePackResistance) ||
      !eqArray(cycle.charge?.cellVoltage, chargeCellVoltages) ||
      !eqArray(cycle.charge?.cellResistance, chargeCellResistances) ||
      !eqBoolean(cycle.excludeFromPlots, excludeFromPlots) ||
      !eqString(cycle.notes, notes)
    );

    const save = () => {
      realm.write(() => {
        const newCycle = realm.create('BatteryCycle', {
          cycleNumber,
          discharge: {
            date: dischargeDate,
            duration: MSSToSeconds(dischargeDuration!),
            packVoltage: toNumber(dischargePackVoltage),
            packResistance: toNumber(dischargePackResistance),
            cellVoltage: dischargeCellVoltages?.map(v => {return parseFloat(v)}),
            cellResistance: dischargeCellResistances?.map(r => {return parseFloat(r)}),
          },
          charge: {
            date: chargeDate,
            amount: toNumber(chargeAmount),
            packVoltage: toNumber(chargePackVoltage),
            packResistance: toNumber(chargePackResistance),
            cellVoltage: chargeCellVoltages?.map(v => {return toNumber(v) || 0}),
            cellResistance: chargeCellResistances?.map(r => {return toNumber(r) || 0}),
          },
          excludeFromPlots,
          notes,
        } as BatteryCycle);

        // Update the battery with changed cycle data.
        battery.cycles[battery.cycles.length - 1] = newCycle;
      });
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({enabled: canSave, action: onDone});
  }, [
    dischargeDate,
    dischargeDuration,
    dischargePackResistance,
    dischargePackVoltage,
    dischargeCellVoltages,
    dischargeCellResistances,
    chargeDate,
    chargeAmount,
    chargePackResistance,
    chargePackVoltage,
    chargeCellVoltages,
    chargeCellResistances,
    excludeFromPlots,
    notes,
   ]);

  useEffect(() => {
    event.on('battery-discharge-cell-resistances', onChangeDischargeCellResistances);
    event.on('battery-discharge-cell-voltages', onChangeDischargeCellVoltages);
    event.on('battery-charge-cell-resistances', onChangeChargeCellResistances);
    event.on('battery-charge-cell-voltages', onChangeChargeCellVoltages);
    event.on('battery-cycle-notes', setNotes);
    return () => {
      event.removeListener('battery-discharge-cell-resistances', onChangeDischargeCellResistances);
      event.removeListener('battery-discharge-cell-voltages', onChangeDischargeCellVoltages);
      event.removeListener('battery-charge-cell-resistances', onChangeChargeCellResistances);
      event.removeListener('battery-charge-cell-voltages', onChangeChargeCellVoltages);
      event.removeListener('battery-cycle-notes', setNotes);
    };
  }, []);

  const onChangeDischargeCellResistances = (result: BatteryCellValuesEditorResult) => {
    setDischargeCellResistances(result.cellValues.map(v => {return v.toString()}));
    setDischargePackResistance(result.packValue.toString());
  };

  const onChangeDischargeCellVoltages = (result: BatteryCellValuesEditorResult) => {
    setDischargeCellVoltages(result.cellValues.map(v => {return v.toString()}));
    setDischargePackVoltage(result.packValue.toString());
  };

  const onChangeChargeCellResistances = (result: BatteryCellValuesEditorResult) => {
    setChargeCellResistances(result.cellValues.map(v => {return v.toString()}));
    setChargePackResistance(result.packValue.toString());
  };

  const onChangeChargeCellVoltages = (result: BatteryCellValuesEditorResult) => {
    setChargeCellVoltages(result.cellValues.map(v => {return v.toString()}));
    setChargePackVoltage(result.packValue.toString());
  };

  const onDischargeDateChange = (date?: Date) => {
    date && setDischargeDate(DateTime.fromJSDate(date).toISO() || DateTime.now().toISO()!);
  };

  const onChargeDateChange = (date?: Date) => {
    date && setChargeDate(DateTime.fromJSDate(date).toISO() || DateTime.now().toISO()!);
  };

  const batterySummary = (battery: Battery) => {
    const capacity = `${battery.capacity}mAh`;
    const cells = `${battery.sCells}S/${battery.pCells}P`;
    const chemistry = battery.chemistry;
    const cycles = `Cycle ${cycle?.cycleNumber} of ${battery.totalCycles} cycles`;
    return `${capacity} ${cells} ${chemistry}\n${cycles}`;
  };

  if (!battery) {
    return (<EmptyView error message={'Battery not found!'} />);
  } else if (!cycle) {
    return (<EmptyView error message={'Battery cycle not found!'} />);
  }
  
  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'BATTERY'} />
      <ListItem
          title={battery.name}
          subtitle={batterySummary(battery)}
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
                name={isCharged ? 'battery-full' : 'battery-quarter'}
                solid={true}
                size={45}
                color={theme.colors.brandPrimary}
                style={s.batteryIcon}
              />
            </View>
          }
      />
      <Divider text={'DISCHARGE PHASE'} />
      <ListItemDate
        title={'Date'}
        value={dischargeDate
          ? DateTime.fromISO(dischargeDate).toFormat(
            "MMM d, yyyy 'at' hh:mm a"
          )
          : 'Tap to Set...'}
        pickerValue={dischargeDate}
        rightImage={false}
        expanded={expandedDischargeDate}
        position={['first']}
        onPress={() => setExpandedDischargeDate(!expandedDischargeDate)}
        onDateChange={onDischargeDateChange}
      />
      <ListItemInput
        title={'Duration'}
        value={dischargeDuration && parseFloat(dischargeDuration) > 0 ? dischargeDuration : undefined}
        titleStyle={!dischargeDuration ? s.required : {}}
        placeholder={'Value'}
        label='m:ss'
        numeric={true}
        numericProps={{prefix: '', separator: ':'}}
        keyboardType={'number-pad'}
        position={['first']}
        onChangeText={setDischargeDuration}
      />
      <ListItemInput
        title={'Pack Voltage'}
        label={'V'}
        value={dischargePackVoltage && parseFloat(dischargePackVoltage) > 0 ? dischargePackVoltage : undefined}
        placeholder={'Value'}
        numeric={true}
        numericProps={{prefix: ''}}
        onChangeText={setDischargePackVoltage}
      />
      <ListItemInput
        title={'Pack Resistance'}
        label={'mΩ'}
        value={dischargePackResistance && parseFloat(dischargePackResistance) > 0 ? dischargePackResistance : undefined}
        placeholder={'Value'}
        numeric={true}
        numericProps={{prefix: '', precision: 3}}
        onChangeText={setDischargePackResistance}
      />
      <ListItem
        title={'Cell Voltage'}
        onPress={() => navigation.navigate('BatteryCellValuesEditor', {
          config: {name: 'voltage', namePlural: 'voltages', label: 'V', precision: 2},
          packValue: Number(dischargePackVoltage),
          cellValues: dischargeCellVoltages?.map(v => {return toNumber(v) || 0}),
          sCells: battery.sCells,
          pCells: battery.pCells,
          eventName: 'battery-discharge-cell-voltages',
        })}
      />
      <ListItem
        title={'Cell Resistance'}
        position={['last']}
        onPress={() => navigation.navigate('BatteryCellValuesEditor', {
          config: {name: 'resistance', namePlural: 'resistances', label: 'mΩ', precision: 3},
          packValue: Number(dischargePackResistance),
          cellValues: dischargeCellResistances?.map(r => {return toNumber(r) || 0}),
          sCells: battery.sCells,
          pCells: battery.pCells,
          eventName: 'battery-discharge-cell-resistances',
        })}
      />
      {cycle.charge &&
        <>
          <Divider text={'CHARGE PHASE'} />
          <ListItemDate
            title={'Date'}
            value={chargeDate
              ? DateTime.fromISO(chargeDate).toFormat(
                "MMM d, yyyy 'at' hh:mm a"
              )
              : 'Tap to Set...'}
            pickerValue={chargeDate}
            rightImage={false}
            expanded={expandedChargeDate}
            position={['first']}
            onPress={() => setExpandedChargeDate(!expandedChargeDate)}
            onDateChange={onChargeDateChange}
          />
          <ListItemInput
            title={'Amount'}
            value={chargeAmount && parseFloat(chargeAmount) > 0 ? chargeAmount : undefined}
            titleStyle={!chargeAmount ? s.required : {}}
            placeholder={'Value'}
            label={'mAh'}
            numeric={true}
            numericProps={{prefix: '', delimiter: '', precision: 0, maxValue: 99999}}
            position={['first']}
            onChangeText={setChargeAmount}
          />
          <ListItem
            title={'Percent of Capacity'}
            value={'0.0%'}
            rightImage={false}
          />
          <ListItemInput
            title={'Pack Voltage'}
            label={'V'}
            value={chargePackVoltage && parseFloat(chargePackVoltage) > 0 ? chargePackVoltage : undefined}
            placeholder={'Value'}
            numeric={true}
            numericProps={{prefix: ''}}
            onChangeText={setChargePackVoltage}
          />
          <ListItemInput
            title={'Pack Resistance'}
            label={'mΩ'}
            value={chargePackResistance && parseFloat(chargePackResistance) > 0 ? chargePackResistance : undefined}
            placeholder={'Value'}
            numeric={true}
            numericProps={{prefix: '', precision: 3}}
            onChangeText={setChargePackResistance}
          />
          <ListItem
            title={'Cell Voltage'}
            onPress={() => navigation.navigate('BatteryCellValuesEditor', {
              config: {name: 'voltage', namePlural: 'voltages', label: 'V', precision: 2},
              packValue: chargePackVoltage && parseFloat(chargePackVoltage) || 0,
              cellValues: chargeCellVoltages?.map(v => {return toNumber(v) || 0}),
              sCells: battery.sCells,
              pCells: battery.pCells,
              eventName: 'battery-charge-cell-voltages',
            })}
          />
          <ListItem
            title={'Cell Resistance'}
            position={['last']}
            onPress={() => navigation.navigate('BatteryCellValuesEditor', {
              config: {name: 'resistance', namePlural: 'resistances', label: 'mΩ', precision: 3},
              packValue: chargePackResistance && parseFloat(chargePackResistance) || 0,
              cellValues: chargeCellResistances?.map(r => {return toNumber(r) || 0}),
              sCells: battery.sCells,
              pCells: battery.pCells,
              eventName: 'battery-charge-cell-resistances',
            })}
          />
        </>
      }
      <Divider text={'CYCLE STATISTICS'} />
      {cycle.charge &&
        <>
          <ListItem
            title={'Energy per Minute'}
            value={
              <View style={s.valueContainer}>
                <Text style={s.value}>
                  {'180'}
                </Text>
                <Text style={s.valueLabel}>
                  {' mAh'}
                </Text>
              </View>
            }
            position={['first']}
            rightImage={false}
          />
          <ListItem
            title={'Time to 80%'}
            value={
              <View style={s.valueContainer}>
                <Text style={s.value}>
                  {'8:00'}
                </Text>
                <Text style={s.valueLabel}>
                  {' m:ss'}
                </Text>
              </View>
            }
            rightImage={false}
          />
        </>
      }
      <ListItemSwitch
        title={'Exclude from Plots'}
        value={excludeFromPlots}
        position={['last']}
        onValueChange={setExcludeFromPlots}
      />
      <Divider text={'NOTES'}/>
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
  )
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
  },
  valueContainer: {
    flexDirection: 'row', left: -25
  },
  value: {
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
  },
  valueLabel: {
    ...theme.styles.textNormal,
    color: theme.colors.subtleGray,
  },
}));

export default BatteryCycleEditorScreen;
