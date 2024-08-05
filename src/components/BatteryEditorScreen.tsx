import { Alert, ScrollView, Text } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import { BatteriesNavigatorParamList, NewBatteryNavigatorParamList } from 'types/navigation';
import { BatteryChemistry, BatteryTint } from 'types/battery';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useRef, useState } from 'react';
import {
  batteryCellConfigurationToString,
  batterySummary,
  getBatteryCellConfigurationItems,
} from 'lib/battery';
import { eqBoolean, eqNumber, eqString, toNumber } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { CompositeScreenProps } from '@react-navigation/core';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { Icon as RNEIcon } from '@rneui/base';
import { ScanCodeSize } from 'types/common';
import { View } from 'react-native';
import WheelPicker from 'components/atoms/WheelPicker';
import { batteryStatistics } from 'lib/battery';
import { batteryTintIcons } from 'lib/battery';
import { makeStyles } from '@rneui/themed';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useCurrencyFormatter } from 'lib/useCurrencyFormatter';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryEditor'>,
  NativeStackScreenProps<NewBatteryNavigatorParamList, 'NewBattery'>
>;

const BatteryEditorScreen = ({ navigation, route }: Props) => {
  const { batteryId, batteryTemplate } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const confirmAction = useConfirmAction();
  const event = useEvent();
  const setDebounced = useDebouncedRender();
  const setScreenEditHeader = useScreenEditHeader();
  const formatCurrency = useCurrencyFormatter();

  const realm = useRealm();
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));
  const isCharged = battery?.cycles[battery.cycles.length - 1]?.charge || !battery?.cycles.length;

  const name = useRef(battery?.name || batteryTemplate?.name || undefined);
  const [chemistry, setChemistry] = useState<BatteryChemistry>(
    battery?.chemistry || batteryTemplate?.chemistry || BatteryChemistry.LiPo,
  );
  const vendor = useRef(battery?.vendor || batteryTemplate?.vendor || undefined);
  const purchasePrice = useRef(battery?.purchasePrice?.toString() || undefined);
  const [retired, setRetired] = useState(battery?.retired || false);
  const cRating = useRef(
    battery?.cRating?.toString() || batteryTemplate?.cRating?.toString() || undefined,
  );
  const capacity = useRef(battery?.capacity?.toString() || batteryTemplate?.capacity?.toString());
  const totalCycles = useRef(battery?.totalCycles?.toString() || undefined);
  const [sCells, setSCells] = useState(
    battery?.sCells?.toString() || batteryTemplate?.sCells?.toString() || '3',
  );
  const [pCells, setPCells] = useState(
    battery?.pCells?.toString() || batteryTemplate?.pCells?.toString() || '1',
  );
  const [tint, setTint] = useState(
    battery?.tint || (batteryTemplate?.tint as BatteryTint) || BatteryTint.None,
  );
  const [scanCodeSize, setScanCodeSize] = useState(battery?.scanCodeSize || ScanCodeSize.None);
  const [notes, setNotes] = useState(battery?.notes || undefined);

  const originalCapacity = useRef(capacity).current;
  const [expandedCellConfiguration, setExpandedCellConfiguration] = useState(false);

  useEffect(() => {
    if (batteryId) return;

    const canSave =
      !!name.current &&
      !!capacity.current &&
      (!eqString(battery?.name, name.current) ||
        !eqString(battery?.chemistry, chemistry) ||
        !eqString(battery?.vendor, vendor.current) ||
        !eqNumber(battery?.purchasePrice, purchasePrice.current) ||
        !eqBoolean(battery?.retired, retired) ||
        !eqNumber(battery?.cRating, cRating.current) ||
        !eqNumber(battery?.capacity, capacity.current) ||
        !eqNumber(battery?.sCells, sCells) ||
        !eqNumber(battery?.pCells, pCells) ||
        !eqNumber(battery?.totalCycles, totalCycles.current) ||
        !eqString(battery?.tint, tint) ||
        !eqString(battery?.scanCodeSize, scanCodeSize) ||
        !eqString(battery?.notes, notes));

    const save = () => {
      realm.write(() => {
        const now = DateTime.now().toISO();
        realm.create('Battery', {
          createdOn: now,
          updatedOn: now,
          name: name.current,
          chemistry,
          vendor: vendor.current,
          purchasePrice: toNumber(purchasePrice.current),
          retired,
          cRating: toNumber(cRating.current),
          capacity: toNumber(capacity.current),
          sCells: toNumber(sCells),
          pCells: toNumber(pCells),
          totalCycles: toNumber(totalCycles.current),
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

    setScreenEditHeader({ enabled: canSave, action: onDone }, undefined, { title: 'New Battery' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    name.current,
    chemistry,
    vendor.current,
    purchasePrice.current,
    retired,
    cRating.current,
    capacity.current,
    sCells,
    pCells,
    totalCycles.current,
    tint,
    scanCodeSize,
    notes,
  ]);

  useEffect(() => {
    if (!batteryId || !battery) return;

    const canSave =
      !!name.current &&
      !!capacity.current &&
      (!eqString(battery?.name, name.current) ||
        !eqString(battery?.vendor, vendor.current) ||
        !eqNumber(battery?.purchasePrice, purchasePrice.current) ||
        !eqBoolean(battery?.retired, retired) ||
        !eqNumber(battery?.cRating, cRating.current) ||
        !eqNumber(battery?.capacity, capacity.current) ||
        !eqNumber(battery?.sCells, sCells) ||
        !eqNumber(battery?.pCells, pCells) ||
        !eqString(battery?.tint, tint) ||
        !eqString(battery?.scanCodeSize, scanCodeSize) ||
        !eqString(battery?.notes, notes));

    if (canSave) {
      realm.write(() => {
        battery.updatedOn = DateTime.now().toISO();
        battery.name = name.current || 'no-name';
        battery.vendor = vendor.current;
        battery.purchasePrice = toNumber(purchasePrice.current);
        battery.retired = retired;
        battery.cRating = toNumber(cRating.current);
        battery.capacity = toNumber(capacity.current) || toNumber(originalCapacity.current);
        battery.sCells = toNumber(sCells) || 1;
        battery.pCells = toNumber(pCells) || 0;
        battery.tint = tint;
        battery.scanCodeSize = scanCodeSize;
        battery.notes = notes;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    name.current,
    vendor.current,
    purchasePrice.current,
    retired,
    cRating.current,
    capacity.current,
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
    event.on('battery-notes', onChangeNotes);

    return () => {
      event.removeListener('battery-chemistry', onChangeChemistry);
      event.removeListener('battery-tint', onChangeBatteryTint);
      event.removeListener('battery-scan-code-size', onChangeScanCodeSize);
      event.removeListener('battery-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const onChangeNotes = (result: NotesEditorResult) => {
    setNotes(result.text);
  };

  const validateCapacity = () => {
    if (!capacity && battery) {
      Alert.alert(
        'Battery Capacity',
        'The battery capacity cannot be zero. Please enter a non-zero value.',
      );
    }
  };

  const averageDischargeRate = () => {
    if (battery?.cycles && battery.cycles.length > 0) {
      return `${batteryStatistics(battery).string.averageDischargeCurrent}, ${battery.cycles.length} cycles`;
    } else {
      return 'No cycles';
    }
  };

  const operatingCost = () => {
    if (battery?.purchasePrice && battery.totalCycles && battery.totalCycles > 0) {
      return formatCurrency(battery.purchasePrice / battery.totalCycles);
    } else {
      return 'Unknown';
    }
  };

  const confirmDeleteBattery = () => {
    confirmAction(deleteBattery, {
      label: 'Delete Battery',
      title: 'This action cannot be undone.\nAre you sure you want to delete this battery?',
      value: battery,
    });
  };

  const deleteBattery = () => {
    realm.write(() => {
      realm.delete(battery);
    });
    navigation.goBack();
  };

  return (
    <AvoidSoftInputView style={[theme.styles.view]}>
      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior={'automatic'}>
        <Divider />
        <ListItem
          title={battery ? battery.name : name.current || 'New Battery'}
          subtitle={battery ? batterySummary(battery) : undefined}
          subtitleNumberOfLines={2}
          containerStyle={{
            ...s.batteryTint,
            borderLeftColor:
              battery && battery?.tint !== BatteryTint.None
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
        <Divider />
        <ListItemInput
          value={name.current}
          placeholder={'New Battery'}
          placeholderTextColor={theme.colors.assertive}
          position={['first']}
          onChangeText={value => setDebounced(() => (name.current = value))}
        />
        <ListItemInput
          value={vendor.current}
          placeholder={'Vendor'}
          position={['last']}
          onChangeText={value => setDebounced(() => (vendor.current = value))}
        />
        <Divider />
        <ListItemInput
          title={'Capacity'}
          value={capacity.current}
          label={'mAh'}
          placeholder={'Value'}
          titleStyle={!capacity.current ? { color: theme.colors.assertive } : {}}
          keyboardType={'number-pad'}
          position={['first']}
          onBlur={validateCapacity}
          onChangeText={value => setDebounced(() => (capacity.current = value))}
        />
        <ListItem
          title={'Chemistry'}
          value={chemistry}
          disabled={!!batteryId}
          rightImage={!batteryId}
          onPress={() =>
            navigation.navigate('EnumPicker', {
              title: 'Chemistry',
              values: Object.values(BatteryChemistry),
              selected: chemistry,
              eventName: 'battery-chemistry',
            })
          }
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
          value={cRating.current}
          label={'C'}
          placeholder={'Unknown'}
          keyboardType={'number-pad'}
          position={['last']}
          onChangeText={value => setDebounced(() => (cRating.current = value))}
        />
        {!batteryId && <Divider />}
        {batteryId && (
          <>
            <Divider text={'BATTERY CYCLES'} />
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
              title={'Battery Cycle Log'}
              value={`${battery?.cycles.length.toString() || '0'} cycles`}
              position={['last']}
              onPress={() =>
                navigation.navigate('BatteryCycles', {
                  batteryId,
                })
              }
            />
          </>
        )}
        {!batteryId && (
          <ListItemInput
            title={'Total Cycles'}
            value={totalCycles.current}
            placeholder={'None'}
            keyboardType={'number-pad'}
            position={['first', 'last']}
            onChangeText={value => setDebounced(() => (totalCycles.current = value))}
          />
        )}
        <Divider />
        <ListItem
          title={'Battery Tint'}
          rightImage={
            <View style={s.tintValueContainer}>
              {tint !== BatteryTint.None && (
                <Icon
                  name={'circle'}
                  solid={true}
                  size={10}
                  style={[{ color: batteryTintIcons[tint]?.color }, s.tintValueDot]}
                />
              )}
              <Text style={s.tintValueText}>{tint}</Text>
              <RNEIcon
                name={'chevron-forward'}
                type={'ionicon'}
                size={20}
                color={theme.colors.midGray}
              />
            </View>
          }
          position={['first']}
          onPress={() =>
            navigation.navigate('EnumPicker', {
              title: 'Battery Tint',
              values: Object.values(BatteryTint),
              selected: tint,
              icons: batteryTintIcons,
              eventName: 'battery-tint',
            })
          }
        />
        <ListItem
          title={'QR Code Size'}
          value={scanCodeSize || 'None'}
          position={['last']}
          onPress={() =>
            navigation.navigate('EnumPicker', {
              title: 'QR Code Size',
              values: Object.values(ScanCodeSize),
              selected: scanCodeSize,
              eventName: 'battery-scan-code-size',
            })
          }
        />
        <Divider />
        <ListItemInput
          title={'Purchase Price'}
          value={purchasePrice.current}
          placeholder={'Unknown'}
          keyboardType={'number-pad'}
          numeric={true}
          position={batteryId ? ['first'] : ['first', 'last']}
          onChangeText={value => setDebounced(() => (purchasePrice.current = value))}
        />
        {batteryId && (
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
        )}
        <Divider />
        <ListItem
          title={'Notes'}
          position={['first', 'last']}
          onPress={() =>
            navigation.navigate('NotesEditor', {
              title: 'String Value Notes',
              text: notes,
              eventName: 'battery-notes',
            })
          }
        />
        <Divider text={'DANGER ZONE'} />
        <ListItem
          title={'Delete Battery'}
          titleStyle={s.delete}
          position={['first', 'last']}
          rightImage={false}
          onPress={confirmDeleteBattery}
        />
        <Divider />
      </ScrollView>
    </AvoidSoftInputView>
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
  delete: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.assertive,
  },
  tintValueContainer: {
    flexDirection: 'row',
    width: 100,
    justifyContent: 'flex-end',
  },
  tintValueDot: {
    alignSelf: 'center',
    marginRight: 5,
  },
  tintValueText: {
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
    marginRight: 5,
  },
}));

export default BatteryEditorScreen;
