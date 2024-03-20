import { AppTheme, useTheme } from 'theme';
import { BatteryCharge, BatteryDischarge } from 'realmdb/BatteryCycle';
import {
  ListItem,
  ListItemDate,
  ListItemInput,
  ListItemInputMethods,
  ListItemSwitch,
} from 'components/atoms/List';
import { MSSToSeconds, secondsToMSS } from 'lib/formatters';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { batteryCycleChargeData, batteryCycleStatisticsData } from 'lib/batteryCycle';
import { eqArray, eqBoolean, eqNumber, eqString, toNumber } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { BatteriesNavigatorParamList } from 'types/navigation';
import { Battery } from 'realmdb/Battery';
import { BatteryCellValuesEditorResult } from 'components/BatteryCellValuesEditorScreen';
import { BatteryTint } from 'types/battery';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { batterySummary } from 'lib/battery';
import { batteryTintIcons } from 'lib/battery';
import { makeStyles } from '@rneui/themed';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryCycleEditor'>;

const BatteryCycleEditorScreen = ({ navigation, route }: Props) => {
  const { batteryId, cycleNumber } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const setDebounced = useDebouncedRender();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));
  const cycle = battery?.cycles.find(c => {
    return c.cycleNumber === cycleNumber;
  });
  const isCharged = battery?.cycles[battery.cycles.length - 1]?.charge || !battery?.cycles.length;

  // Discharge phase
  const [dischargeDate, setDischargeDate] = useState(cycle?.discharge?.date);
  const dischargeDuration = useRef(secondsToMSS(cycle?.discharge?.duration) || undefined);
  const dischargePackVoltage = useRef(cycle?.discharge?.packVoltage?.toString() || undefined);
  const dischargePackResistance = useRef(cycle?.discharge?.packResistance?.toString() || undefined);
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  const [dischargeCellVoltages, setDischargeCellVoltages] = useState<string[]>(
    cycle?.discharge?.cellVoltage ||
      (battery ? new Array(battery.sCells * battery.pCells).fill('0') : []),
  );
  const [dischargeCellResistances, setDischargeCellResistances] = useState<string[]>(
    cycle?.discharge?.cellResistance ||
      (battery ? new Array(battery.sCells * battery.pCells).fill('0') : []),
  );

  // Charge phase
  const [chargeDate, setChargeDate] = useState(cycle?.charge?.date);
  const chargeAmount = useRef(cycle?.charge?.amount?.toString() || undefined);
  const chargePackVoltage = useRef(cycle?.charge?.packVoltage?.toString() || undefined);
  const chargePackResistance = useRef(cycle?.charge?.packResistance?.toString() || undefined);
  // Ordering P first then S: 1P/1S, 1P/2S, 2P/1S, 2P/2S...
  const [chargeCellVoltages, setChargeCellVoltages] = useState<string[]>(
    cycle?.charge?.cellVoltage ||
      (battery ? new Array(battery.sCells * battery.pCells).fill('0') : []),
  );
  const [chargeCellResistances, setChargeCellResistances] = useState<string[]>(
    cycle?.charge?.cellResistance ||
      (battery ? new Array(battery.sCells * battery.pCells).fill('0') : []),
  );
  const [excludeFromPlots, setExcludeFromPlots] = useState(false);
  const [notes, setNotes] = useState<string | undefined>(undefined);

  const batteryCycleCharge = cycle && batteryCycleChargeData(cycle);
  const batteryCycleStats = cycle && batteryCycleStatisticsData(cycle);

  const [expandedDischargeDate, setExpandedDischargeDate] = useState(false);
  const [expandedChargeDate, setExpandedChargeDate] = useState(false);

  const dischargeDurationRef = useRef<ListItemInputMethods>(null);
  const dischargePackResistanceRef = useRef<ListItemInputMethods>(null);
  const dischargePackVoltageRef = useRef<ListItemInputMethods>(null);
  const chargeAmountRef = useRef<ListItemInputMethods>(null);
  const chargePackResistanceRef = useRef<ListItemInputMethods>(null);
  const chargePackVoltageRef = useRef<ListItemInputMethods>(null);

  useEffect(() => {
    if (!battery || !cycle) return;

    const canSave =
      !(cycle.discharge && !dischargeDuration.current) &&
      !(cycle.charge && !chargeAmount.current) &&
      (!eqString(cycle.discharge?.date, dischargeDate) ||
        (dischargeDuration.current &&
          !eqNumber(
            cycle.discharge?.duration,
            MSSToSeconds(dischargeDuration.current).toString(),
          )) ||
        !eqNumber(cycle.discharge?.packVoltage, dischargePackVoltage.current) ||
        !eqNumber(cycle.discharge?.packResistance, dischargePackResistance.current) ||
        !eqArray(cycle.discharge?.cellVoltage, dischargeCellVoltages) ||
        !eqArray(cycle.discharge?.cellResistance, dischargeCellResistances) ||
        !eqString(cycle.charge?.date, chargeDate) ||
        !eqNumber(cycle.charge?.amount, chargeAmount.current) ||
        !eqNumber(cycle.charge?.packVoltage, chargePackVoltage.current) ||
        !eqNumber(cycle.charge?.packResistance, chargePackResistance.current) ||
        (cycle.charge && !eqArray(cycle.charge?.cellVoltage, chargeCellVoltages)) ||
        (cycle.charge && !eqArray(cycle.charge?.cellResistance, chargeCellResistances)) ||
        !eqBoolean(cycle.excludeFromPlots, excludeFromPlots) ||
        !eqString(cycle.notes, notes));

    const save = () => {
      realm.write(() => {
        cycle.discharge = {
          date: dischargeDate,
          duration: dischargeDuration.current ? MSSToSeconds(dischargeDuration.current) : 0,
          packVoltage: toNumber(dischargePackVoltage.current),
          packResistance: toNumber(dischargePackResistance.current),
          cellVoltage: dischargeCellVoltages?.map(v => {
            return parseFloat(v);
          }),
          cellResistance: dischargeCellResistances?.map(r => {
            return parseFloat(r);
          }),
        } as BatteryDischarge;
        if (cycle.charge) {
          cycle.charge = {
            date: chargeDate,
            amount: toNumber(chargeAmount.current),
            packVoltage: toNumber(chargePackVoltage.current),
            packResistance: toNumber(chargePackResistance.current),
            cellVoltage: chargeCellVoltages?.map(v => {
              return toNumber(v) || 0;
            }),
            cellResistance: chargeCellResistances?.map(r => {
              return toNumber(r) || 0;
            }),
          } as BatteryCharge;
        }
        cycle.excludeFromPlots = excludeFromPlots;
        cycle.notes = notes;
      });
    };

    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({ enabled: canSave, action: onDone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dischargeDate,
    dischargeDuration.current,
    dischargePackResistance.current,
    dischargePackVoltage.current,
    dischargeCellVoltages,
    dischargeCellResistances,
    chargeDate,
    chargeAmount.current,
    chargePackResistance.current,
    chargePackVoltage.current,
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
    event.on('battery-cycle-notes', onChangeNotes);
    return () => {
      event.removeListener('battery-discharge-cell-resistances', onChangeDischargeCellResistances);
      event.removeListener('battery-discharge-cell-voltages', onChangeDischargeCellVoltages);
      event.removeListener('battery-charge-cell-resistances', onChangeChargeCellResistances);
      event.removeListener('battery-charge-cell-voltages', onChangeChargeCellVoltages);
      event.removeListener('battery-cycle-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeDischargeCellResistances = (result: BatteryCellValuesEditorResult) => {
    setDischargeCellResistances(
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    dischargePackResistance.current = result.packValue.toString();
    dischargePackResistanceRef.current?.setValue(result.packValue.toString());
  };

  const onChangeDischargeCellVoltages = (result: BatteryCellValuesEditorResult) => {
    setDischargeCellVoltages(
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    dischargePackVoltage.current = result.packValue.toString();
    dischargePackVoltageRef.current?.setValue(result.packValue.toString());
  };

  const onChangeChargeCellResistances = (result: BatteryCellValuesEditorResult) => {
    setChargeCellResistances(
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    chargePackResistance.current = result.packValue.toString();
    chargePackResistanceRef.current?.setValue(result.packValue.toString());
  };

  const onChangeChargeCellVoltages = (result: BatteryCellValuesEditorResult) => {
    setChargeCellVoltages(
      result.cellValues.map(v => {
        return v.toString();
      }),
    );
    chargePackVoltage.current = result.packValue.toString();
    chargePackVoltageRef.current?.setValue(result.packValue.toString());
  };

  const onDischargeDateChange = (date?: Date) => {
    date && setDischargeDate(DateTime.fromJSDate(date).toISO() || DateTime.now().toISO());
  };

  const onChargeDateChange = (date?: Date) => {
    date && setChargeDate(DateTime.fromJSDate(date).toISO() || DateTime.now().toISO());
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    setNotes(result.text);
  };

  if (!battery) {
    return <EmptyView error message={'Battery not found!'} />;
  } else if (!cycle) {
    return <EmptyView error message={'Battery cycle not found!'} />;
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
          borderLeftColor:
            battery.tint !== BatteryTint.None
              ? batteryTintIcons[battery.tint]?.color
              : theme.colors.transparent,
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
        value={
          dischargeDate
            ? DateTime.fromISO(dischargeDate).toFormat("MMM d, yyyy 'at' h:mm a")
            : 'Tap to Set...'
        }
        pickerValue={dischargeDate}
        expanded={expandedDischargeDate}
        position={['first']}
        onPress={() => setExpandedDischargeDate(!expandedDischargeDate)}
        onDateChange={onDischargeDateChange}
      />
      <ListItemInput
        ref={dischargeDurationRef}
        title={'Duration'}
        value={
          dischargeDuration.current && parseFloat(dischargeDuration.current) > 0
            ? dischargeDuration.current
            : undefined
        }
        titleStyle={!dischargeDuration.current ? s.required : {}}
        placeholder={'Value'}
        label="m:ss"
        numeric={true}
        numericProps={{ prefix: '', separator: ':' }}
        keyboardType={'number-pad'}
        position={['first']}
        onChangeText={value => setDebounced(() => (dischargeDuration.current = value))}
      />
      <ListItemInput
        ref={dischargePackVoltageRef}
        title={'Pack Voltage'}
        label={'V'}
        value={
          dischargePackVoltage.current && parseFloat(dischargePackVoltage.current) > 0
            ? parseFloat(dischargePackVoltage.current).toFixed(3)
            : undefined
        }
        placeholder={'Value'}
        numeric={true}
        numericProps={{ prefix: '' }}
        onChangeText={value => setDebounced(() => (dischargePackVoltage.current = value))}
      />
      <ListItemInput
        ref={dischargePackResistanceRef}
        title={'Pack Resistance'}
        label={'mΩ'}
        value={
          dischargePackResistance.current && parseFloat(dischargePackResistance.current) > 0
            ? parseFloat(dischargePackResistance.current).toFixed(3)
            : undefined
        }
        placeholder={'Value'}
        numeric={true}
        numericProps={{ prefix: '', precision: 3 }}
        onChangeText={value => setDebounced(() => (dischargePackResistance.current = value))}
      />
      <ListItem
        title={'Cell Voltage'}
        onPress={() =>
          navigation.navigate('BatteryCellValuesEditor', {
            config: { name: 'voltage', namePlural: 'voltages', label: 'V', precision: 2 },
            packValue: Number(dischargePackVoltage.current),
            cellValues: dischargeCellVoltages?.map(v => {
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
        position={['last']}
        onPress={() =>
          navigation.navigate('BatteryCellValuesEditor', {
            config: { name: 'resistance', namePlural: 'resistances', label: 'mΩ', precision: 3 },
            packValue: Number(dischargePackResistance.current),
            cellValues: dischargeCellResistances?.map(r => {
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
          <ListItemDate
            title={'Date'}
            value={
              chargeDate
                ? DateTime.fromISO(chargeDate).toFormat("MMM d, yyyy 'at' h:mm a")
                : 'Tap to Set...'
            }
            pickerValue={chargeDate}
            expanded={expandedChargeDate}
            position={['first']}
            onPress={() => setExpandedChargeDate(!expandedChargeDate)}
            onDateChange={onChargeDateChange}
          />
          <ListItemInput
            ref={chargeAmountRef}
            title={'Amount'}
            value={
              chargeAmount.current && parseFloat(chargeAmount.current) > 0
                ? chargeAmount.current
                : undefined
            }
            titleStyle={!chargeAmount ? s.required : {}}
            placeholder={'Value'}
            label={'mAh'}
            numeric={true}
            numericProps={{ prefix: '', delimiter: '', precision: 0, maxValue: 99999 }}
            position={['first']}
            onChangeText={value => setDebounced(() => (chargeAmount.current = value))}
          />
          <ListItem
            title={'Percent of Capacity'}
            value={batteryCycleCharge?.string.chargeToCapacityPercentage}
            rightImage={false}
          />
          <ListItemInput
            ref={chargePackVoltageRef}
            title={'Pack Voltage'}
            label={'V'}
            value={
              chargePackVoltage.current && parseFloat(chargePackVoltage.current) > 0
                ? parseFloat(chargePackVoltage.current).toFixed(3)
                : undefined
            }
            placeholder={'Value'}
            numeric={true}
            numericProps={{ prefix: '' }}
            onChangeText={value => setDebounced(() => (chargePackVoltage.current = value))}
          />
          <ListItemInput
            ref={chargePackResistanceRef}
            title={'Pack Resistance' + chargePackResistance.current}
            label={'mΩ'}
            value={
              chargePackResistance.current && parseFloat(chargePackResistance.current) > 0
                ? parseFloat(chargePackResistance.current).toFixed(3)
                : undefined
            }
            placeholder={'Value'}
            numeric={true}
            numericProps={{ prefix: '', precision: 3 }}
            onChangeText={value => setDebounced(() => (chargePackResistance.current = value))}
          />
          <ListItem
            title={'Cell Voltage'}
            onPress={() =>
              navigation.navigate('BatteryCellValuesEditor', {
                config: { name: 'voltage', namePlural: 'voltages', label: 'V', precision: 2 },
                packValue:
                  (chargePackVoltage.current && parseFloat(chargePackVoltage.current)) || 0,
                cellValues: chargeCellVoltages?.map(v => {
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
            position={['last']}
            onPress={() =>
              navigation.navigate('BatteryCellValuesEditor', {
                config: {
                  name: 'resistance',
                  namePlural: 'resistances',
                  label: 'mΩ',
                  precision: 3,
                },
                packValue:
                  (chargePackResistance.current && parseFloat(chargePackResistance.current)) || 0,
                cellValues: chargeCellResistances?.map(r => {
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
                <Text style={s.value}>{batteryCycleStats?.value.averageDischargeCurrent}</Text>
                <Text style={s.valueLabel}>{' mAh'}</Text>
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
                  {secondsToMSS(batteryCycleStats?.value.dischargeBy80Percent, { format: 'm:ss' })}
                </Text>
                <Text style={s.valueLabel}>{' m:ss'}</Text>
              </View>
            }
            rightImage={false}
          />
        </>
      )}
      <ListItemSwitch
        title={'Exclude from Plots'}
        value={excludeFromPlots}
        position={['last']}
        onValueChange={setExcludeFromPlots}
      />
      <Divider text={'NOTES'} />
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
  valueContainer: {
    flexDirection: 'row',
    left: -25,
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
