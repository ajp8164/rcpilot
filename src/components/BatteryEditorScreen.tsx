import { Alert, ScrollView, Text } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import { BatteriesNavigatorParamList, NewBatteryNavigatorParamList } from 'types/navigation';
import { BatteryChemistry, BatteryTint } from 'types/battery';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useRef, useState } from 'react';
import { batteryCellConfigurationToString, getBatteryCellConfigurationItems } from 'lib/battery';
import { eqBoolean, eqNumber, eqString, toNumber } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon as RNEIcon } from "@rneui/base";
import { ScanCodeSize } from 'types/common';
import { View } from 'react-native';
import WheelPicker from 'components/atoms/WheelPicker';
import { batteryTintIcons } from 'lib/battery';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryEditor'>,
  NativeStackScreenProps<NewBatteryNavigatorParamList, 'NewBattery'>
>;

const BatteryEditorScreen = ({ navigation, route }: Props) => {  
  const { batteryId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));

  const [name, setName] = useState(battery?.name || undefined);
  const [chemistry, setChemistry] = useState<BatteryChemistry>(battery?.chemistry || BatteryChemistry.LiPo);
  const [vendor, setVendor] = useState(battery?.vendor || undefined);
  const [purchasePrice, setPurchasePrice] = useState(battery?.purchasePrice?.toString() || undefined);
  const [retired, setRetired] = useState(battery?.retired || false);
  const [cRating, setCRating] = useState(battery?.cRating?.toString() || undefined);
  const [capacity, setCapacity] = useState(battery?.capacity?.toString() || '1000');
  const [totalCycles, setTotalCycles] = useState(battery?.totalCycles?.toString() || undefined);
  const [sCells, setSCells] = useState(battery?.sCells?.toString() || '3');
  const [pCells, setPCells] = useState(battery?.pCells?.toString() || '1');
  const [tint, setTint] = useState(battery?.tint || BatteryTint.None);
  const [scanCodeSize, setScanCodeSize] = useState(battery?.scanCodeSize || ScanCodeSize.None);
  const [notes, setNotes] = useState(battery?.notes || undefined);

  const originalCapacity = useRef(capacity).current;
  const [expandedCellConfiguration, setExpandedCellConfiguration] = useState(false);

  useEffect(() => {
    if (batteryId) return;

    const canSave = !!name && !!capacity && (
      !eqString(battery?.name, name) ||
      !eqString(battery?.chemistry, chemistry) ||
      !eqString(battery?.vendor, vendor) ||
      !eqNumber(battery?.purchasePrice, purchasePrice) ||
      !eqBoolean(battery?.retired, retired) ||
      !eqNumber(battery?.cRating, cRating) ||
      !eqNumber(battery?.capacity, capacity) ||
      !eqNumber(battery?.sCells, sCells) ||
      !eqNumber(battery?.pCells, pCells) ||
      !eqString(battery?.tint, tint) ||
      !eqString(battery?.scanCodeSize, scanCodeSize) ||
      !eqString(battery?.notes, notes)
    );

    const save = () => {
      realm.write(() => {
        realm.create('Battery', {
          name,
          chemistry,
          vendor,
          purchasePrice: toNumber(purchasePrice),
          retired,
          cRating: toNumber(cRating),
          capacity: toNumber(capacity),
          sCells: toNumber(sCells),
          pCells: toNumber(pCells),
          tint,
          scanCodeSize,
          notes,
        });
      });
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader(
      {condition: canSave, action: onDone},
      undefined,
      {title: 'New Battery'}
    );
  }, [
    name,
    chemistry,
    vendor,
    purchasePrice,
    retired,
    cRating,
    capacity,
    sCells,
    pCells,
    tint,
    scanCodeSize,
    notes,
  ]);

  useEffect(() => {
    if (!batteryId || !battery) return;

    const canSave = !!name && (
      !eqString(battery?.name, name) ||
      !eqString(battery?.vendor, vendor) ||
      !eqNumber(battery?.purchasePrice, purchasePrice) ||
      !eqBoolean(battery?.retired, retired) ||
      !eqNumber(battery?.cRating, cRating) ||
      !eqNumber(battery?.capacity, capacity) ||
      !eqNumber(battery?.sCells, sCells) ||
      !eqNumber(battery?.pCells, pCells) ||
      !eqString(battery?.tint, tint) ||
      !eqString(battery?.scanCodeSize, scanCodeSize) ||
      !eqString(battery?.notes, notes)
    );

    if (canSave) {
      realm.write(() => {
        battery.name = name!;
        battery.vendor = vendor;
        battery.purchasePrice = toNumber(purchasePrice),
        battery.retired = retired;
        battery.cRating = toNumber(cRating);
        battery.capacity = toNumber(capacity) || toNumber(originalCapacity);
        battery.sCells = toNumber(sCells)!;
        battery.pCells = toNumber(pCells)!;
        battery.tint = tint;
        battery.scanCodeSize = scanCodeSize;
        battery.notes = notes;
      });
    }
    }, [ 
    name,
    vendor,
    purchasePrice,
    retired,
    cRating,
    capacity,
    sCells,
    pCells,
    tint,
    scanCodeSize,
    notes,
  ]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('battery-chemistry', onChangeChemistry);
    event.on('battery-tint', onChangeBatteryTint);
    event.on('battery-scan-code-size', onChangeScanCodeSize);
    event.on('battery-notes', setNotes);

    return () => {
      event.removeListener('battery-chemistry', onChangeChemistry);
      event.removeListener('battery-tint', onChangeBatteryTint);
      event.removeListener('battery-scan-code-size', onChangeScanCodeSize);
      event.removeListener('battery-notes', setNotes);
    };
  }, []);

  const onChangeChemistry = (result: EnumPickerResult) => {
    setChemistry(result.value[0] as BatteryChemistry);
  };

  const onChangeBatteryTint = (result: EnumPickerResult) => {
    setTint(result.value[0] as BatteryTint);
  };

  const onChangeScanCodeSize = (result: EnumPickerResult) => {
    setScanCodeSize(result.value[0] as ScanCodeSize);
  };

  const validateCapacity = () => {
    if (!capacity && battery) {
      Alert.alert(
        'Battery Capacity',
        'The battery capacity cannot be zero. Please enter a non-zero value.'
      );
    }
  };

  const averageDischargeRate = () => {
    // Compute average discharge rate over logged cycles.
    if (battery?.totalCycles && battery.totalCycles > 0) {
      return '0.2A/min average, 30 cycles';
    } else {
      return 'No cycles';
    }
  };

  const operatingCost = () => {
    if (battery?.purchasePrice && battery?.totalCycles) {
      return `${battery?.purchasePrice / battery?.totalCycles}`;
    } else {
      return 'Unknown';
    }
  };

  return (
    <AvoidSoftInputView style={[theme.styles.view]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider />
        <ListItemInput
          value={name}
          placeholder={'New Battery'}
          position={['first']}
          onChangeText={setName}
        />
        <ListItemInput
          value={vendor}
          placeholder={'Vendor'}
          position={['last']}
          onChangeText={setVendor}
        />
        <Divider />
        <ListItemInput
          title={'Capacity'}
          value={capacity}
          label='mAh'
          placeholder={'Value'}
          titleStyle={!capacity.length ? {color: theme.colors.assertive} : {}}
          keyboardType={'number-pad'}
          position={['first']}
          onBlur={validateCapacity}
          onChangeText={setCapacity}
        />
        <ListItem
          title={'Chemistry'}
          value={chemistry}
          disabled={!!batteryId}
          rightImage={!batteryId}
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Chemistry',
            values: Object.values(BatteryChemistry),
            selected: chemistry,
            eventName: 'battery-chemistry',
          })}
        />
        <ListItem
          title={'Cell Configuration'}
          value={batteryCellConfigurationToString(chemistry, [sCells, pCells])}
          expanded={expandedCellConfiguration}
          onPress={() => setExpandedCellConfiguration(!expandedCellConfiguration)}
          ExpandableComponent={
            <WheelPicker
              placeholder={'none'}
              itemWidth={['35%', '60%']}
              items={getBatteryCellConfigurationItems(chemistry)}
              value={[sCells, pCells]}
              wheelVisible={[true, true]}
              onValueChange={(_wheelIndex, value, _index) => {
                if (Array.isArray(value)) {
                  setSCells(value[0]);
                  setPCells(value[1]);
                }
              }}
            />
          }
        />
        <ListItemInput
          title={'Discharge Rate'}
          value={cRating}
          label={'C'}
          placeholder={'Unknown'}
          keyboardType={'number-pad'}
          position={['last']}
          onChangeText={setCRating}
        />
        <Divider />
        {batteryId &&
          <>
            <ListItem
              title={'Statistics'}
              value={averageDischargeRate()}
              position={['first']}
              rightImage={false}
            />
            <ListItem
              title={'Battery Performance'}
              onPress={() => navigation.navigate('BatteryPerformance')}
            />
            <ListItem
              title={'Logged Cycle Details'}
              value={battery?.totalCycles?.toString() || '0'}
              position={['last']}
              onPress={() => navigation.navigate('BatteryCycles')}
            />
          </>
        }
        {!batteryId &&
          <ListItemInput
            title={'Total Cycles'}
            value={totalCycles}
            placeholder={'None'}
            keyboardType={'number-pad'}
            position={['first', 'last']}
            onChangeText={setTotalCycles}
          />
        }
        <Divider />
        <ListItem
          title={'Battery Tint'}
          rightImage={(
            <View style={s.tintValueContainer}>
              {tint !== BatteryTint.None && 
                <Icon
                  name={'circle'}
                  solid={true}
                  size={10}
                  style={[{color: batteryTintIcons[tint]?.color}, s.tintValueDot]}
                />
              }
              <Text style={s.tintValueText}>{tint}</Text>
              <RNEIcon
                name={'chevron-forward'}
                type={'ionicon'}
                size={20}
                color={theme.colors.midGray}
              />
            </View>
          )}
          position={['first']}
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'Battery Tint',
            values: Object.values(BatteryTint),
            selected: tint,
            icons: batteryTintIcons,
            eventName: 'battery-tint',
          })}
        />
        <ListItem
          title={'QR Code Size'}
          value={scanCodeSize || 'None'}
          position={['last']}
          onPress={() => navigation.navigate('EnumPicker', {
            title: 'QR Code Size',
            values: Object.values(ScanCodeSize),
            selected: scanCodeSize,
            eventName: 'battery-scan-code-size',
          })}
        />
        <Divider />
        <ListItemInput
          title={'Purchase Price'}
          value={purchasePrice}
          placeholder={'Unknown'}
          keyboardType={'number-pad'}
          position={batteryId ? ['first'] : ['first', 'last']}
          onChangeText={setPurchasePrice}
        />
        {batteryId &&
        <>
          <ListItem
            title={'Operating Cost'}
            value={`${operatingCost()} per cycle`}
            rightImage={false}
          />
          <ListItemSwitch
            title={'Battery is Retired'}
            position={['last']}
            value={retired}
            onValueChange={setRetired}
          />
        </>
        }
        <Divider />
        <ListItem
          title={'Notes'}
          position={['first', 'last']}
          onPress={() => navigation.navigate('Notes', {
            title: 'String Value Notes',
            text: notes,
            eventName: 'battery-notes',
          })}
        />
        <Divider />
      </ScrollView>
    </AvoidSoftInputView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  tintValueContainer: {
    flexDirection: 'row',
    width: 100,
    justifyContent: 'flex-end',
  },
  tintValueDot: {
    alignSelf: 'center',
    marginRight: 5
  },
  tintValueText: {
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
    marginRight: 5,
  }
}));

export default BatteryEditorScreen;
