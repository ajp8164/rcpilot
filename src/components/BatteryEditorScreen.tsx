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
  ListItemCollapsible,
  ListItemSwitch,
  ThemeManager,
  WheelPicker,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { EnumPickerResult } from 'components/EnumPickerScreen';
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
import { Formik, FormikProps } from 'formik';
import {
  batteryCellConfigurationToString,
  batteryStatistics,
  batterySummary,
  batteryTintIconProps,
  batteryTintIcons,
  getBatteryCellConfigurationItems,
} from 'lib/battery';
import { Masks } from 'lib/inputMasks';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useCurrencyFormatter } from 'lib/useCurrencyFormatter';
import { BatteryFull, BatteryLow, Circle } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { BatteryChemistry, BatteryTint } from 'types/battery';
import { ScanCodeSize } from 'types/common';
import {
  BatteriesNavigatorParamList,
  NewBatteryNavigatorParamList,
} from 'types/navigation';
import * as Yup from 'yup';

// Order of fields for accessory view.
enum Fields {
  name,
  vendor,
  capacity,
  cRating,
  purchasePrice,
  totalCycles,
}

type FormValues = {
  name: string;
  chemistry: BatteryChemistry;
  vendor: string;
  purchasePrice: string;
  retired: boolean;
  cRating: string;
  capacity: string;
  sCells: string;
  pCells: string;
  totalCycles: string;
  tint: BatteryTint;
  scanCodeSize: ScanCodeSize;
  notes: string;
};

export type Props = CompositeScreenProps<
  NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryEditor'>,
  NativeStackScreenProps<NewBatteryNavigatorParamList, 'NewBattery'>
>;

const BatteryEditorScreen = ({ navigation, route }: Props) => {
  const { batteryId, batteryTemplate } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const confirmAction = useConfirmAction();
  const event = useEvent();
  const formatCurrency = useCurrencyFormatter();

  const realm = useRealm();
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));
  const isCharged =
    battery?.cycles[battery.cycles.length - 1]?.charge ||
    !battery?.cycles.length;

  const initialValues = {
    name: battery?.name || batteryTemplate?.name || '',
    chemistry:
      battery?.chemistry || batteryTemplate?.chemistry || BatteryChemistry.LiPo,
    vendor: battery?.vendor || batteryTemplate?.vendor || '',
    purchasePrice: battery?.purchasePrice
      ? battery?.purchasePrice?.toFixed(2)
      : '',
    retired: battery?.retired || false,
    cRating: battery?.cRating ? battery?.cRating.toFixed() : '',
    capacity:
      battery?.capacity?.toFixed() ||
      batteryTemplate?.capacity?.toFixed() ||
      '1000',
    sCells:
      battery?.sCells?.toFixed() || batteryTemplate?.sCells?.toFixed() || '3',
    pCells:
      battery?.pCells?.toFixed() || batteryTemplate?.pCells?.toFixed() || '1',
    totalCycles: battery?.totalCycles ? battery?.totalCycles.toFixed() : '',
    tint:
      battery?.tint ||
      (batteryTemplate?.tint as BatteryTint) ||
      BatteryTint.None,
    scanCodeSize: battery?.scanCodeSize || ScanCodeSize.None,
    notes: battery?.notes || '',
  } as FormValues;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    chemistry: Yup.string().required(),
    vendor: Yup.string(),
    purchasePrice: Yup.string(),
    retired: Yup.string().required(),
    cRating: Yup.string(),
    capacity: Yup.string().required(),
    sCells: Yup.string(),
    pCells: Yup.string(),
    totalCycles: Yup.string(),
    tint: Yup.string(),
    scanCodeSize: Yup.string(),
    notes: Yup.string(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);
  const vendorFieldRef = useRef<ListItemInputMethods>(null);
  const capacityFieldRef = useRef<ListItemInputMethods>(null);
  const cRatingFieldRef = useRef<ListItemInputMethods>(null);
  const purchasePriceFieldRef = useRef<ListItemInputMethods>(null);
  const totalCyclesFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [
        nameFieldRef.current,
        vendorFieldRef.current,
        capacityFieldRef.current,
        cRatingFieldRef.current,
        purchasePriceFieldRef.current,
        totalCyclesFieldRef.current,
      ].filter(Boolean),
    );
  }, []);

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
    if (battery) {
      realm.write(() => {
        battery.updatedOn = now;
        battery.name = values.name || 'no-name';
        battery.chemistry = values.chemistry;
        battery.vendor = values.vendor;
        battery.purchasePrice = parseFloat(values.purchasePrice) || 0;
        battery.retired = values.retired;
        battery.cRating = parseFloat(values.cRating) || 0;
        battery.capacity = parseFloat(values.capacity);
        battery.sCells = parseFloat(values.sCells);
        battery.pCells = parseFloat(values.pCells);
        battery.totalCycles = parseFloat(values.totalCycles) || 0;
        battery.tint = values.tint;
        battery.scanCodeSize = values.scanCodeSize;
        battery.notes = values.notes;
      });
    } else {
      realm.write(() => {
        realm.create('Battery', {
          createdOn: now,
          updatedOn: now,
          name: values.name || 'no-name',
          chemistry: values.chemistry,
          vendor: values.vendor,
          purchasePrice: parseFloat(values.purchasePrice) || 0,
          retired: values.retired,
          cRating: parseFloat(values.cRating) || 0,
          capacity: parseFloat(values.capacity),
          sCells: parseFloat(values.sCells),
          pCells: parseFloat(values.pCells),
          totalCycles: parseFloat(values.totalCycles) || 0,
          tint: values.tint,
          scanCodeSize: values.scanCodeSize,
          notes: values.notes,
        });
      });
    }
  };

  const onChangeChemistry = (result: EnumPickerResult) => {
    formikRef.current?.setFieldValue('chemistry', result.value[0]);
  };

  const onChangeBatteryTint = (result: EnumPickerResult) => {
    formikRef.current?.setFieldValue('tint', result.value[0]);
  };

  const onChangeScanCodeSize = (result: EnumPickerResult) => {
    formikRef.current?.setFieldValue('scanCodeSize', result.value[0]);
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    formikRef.current?.setFieldValue('notes', result.text);
  };

  const averageDischargeRate = () => {
    if (battery?.cycles && battery.cycles.length > 0) {
      return `${batteryStatistics(battery).string.averageDischargeCurrent}, ${battery.cycles.length} cycles`;
    } else {
      return 'No cycles';
    }
  };

  const operatingCost = () => {
    if (
      battery?.purchasePrice &&
      battery.totalCycles &&
      battery.totalCycles > 0
    ) {
      return formatCurrency(battery.purchasePrice / battery.totalCycles);
    } else {
      return 'Unknown';
    }
  };

  const deleteBattery = () => {
    realm.write(() => {
      realm.delete(battery);
    });
    navigation.goBack();
  };

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
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

  return (
    <>
      <AvoidSoftInputView style={[theme.styles.view]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}>
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
                <Divider />
                <ListItem
                  title={values.name || 'New Battery'}
                  subtitle={batterySummary(values as unknown as Battery)}
                  subtitleLines={2}
                  position={['first', 'last']}
                  containerStyle={{
                    ...s.batteryTint,
                    borderLeftColor:
                      values.tint !== BatteryTint.None
                        ? batteryTintIconProps[values.tint]?.color
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
                <Divider />
                <ListItemInput
                  ref={nameFieldRef}
                  position={['first']}
                  error={!!errors.name}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: handleChange('name'),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.name),
                    value: values.name,
                    label: 'Battery Name',
                    placeholder: 'New Battery',
                    autoCapitalize: 'words',
                  }}
                />
                <ListItemInput
                  ref={vendorFieldRef}
                  position={['last']}
                  error={!!errors.vendor}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: handleChange('vendor'),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.vendor),
                    value: values.vendor,
                    label: 'Vendor',
                    placeholder: 'Vendor',
                    autoCapitalize: 'words',
                  }}
                />
                <Divider />
                <ListItemInput
                  ref={capacityFieldRef}
                  title={'Capacity'}
                  position={['first']}
                  error={!!errors.capacity}
                  units={'mAh'}
                  container={'right'}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: (_, unformatted) =>
                      handleChange('capacity')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.capacity),
                    value: values.capacity,
                    mask: Masks.MAH,
                    delimiter: '',
                    rtlNumber: true,
                    placeholder: '0',
                    keyboardType: 'number-pad',
                  }}
                />
                <ListItem
                  title={'Chemistry'}
                  value={values.chemistry}
                  disabled={!!batteryId}
                  rightContent={!batteryId ? 'chevron-right' : undefined}
                  onPress={() =>
                    navigation.navigate('EnumPicker', {
                      title: 'Chemistry',
                      values: Object.values(BatteryChemistry),
                      selected: values.chemistry,
                      eventName: 'battery-chemistry',
                    })
                  }
                />
                <ListItemCollapsible
                  title={'Cell Configuration'}
                  value={batteryCellConfigurationToString(values.chemistry, [
                    values.sCells,
                    values.pCells,
                  ])}>
                  <WheelPicker
                    placeholder={'none'}
                    itemWidth={['35%', '60%']}
                    items={getBatteryCellConfigurationItems(values.chemistry)}
                    value={[values.sCells, values.pCells]}
                    wheelVisible={[true, true]}
                    onValueChange={(_wheelIndex, value, _index) => {
                      if (Array.isArray(value)) {
                        setFieldValue('sCells', value[0]);
                        setFieldValue('pCells', value[1]);
                      }
                    }}
                  />
                </ListItemCollapsible>
                <ListItemInput
                  ref={cRatingFieldRef}
                  title={'Discharge Rate'}
                  position={['last']}
                  error={!!errors.cRating}
                  units={'C'}
                  container={'right'}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: (_, unformatted) =>
                      handleChange('cRating')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.cRating),
                    value: values.cRating,
                    mask: Masks.C_RATING,
                    rtlNumber: true,
                    placeholder: 'Unknown',
                    keyboardType: 'number-pad',
                  }}
                />
                {!batteryId && <Divider />}
                {batteryId && (
                  <>
                    <Divider text={'BATTERY CYCLES'} />
                    <ListItem
                      title={'Statistics'}
                      value={averageDischargeRate()}
                      position={['first']}
                    />
                    <ListItem
                      title={'Battery Performance'}
                      rightContent={'chevron-right'}
                      onPress={() => navigation.navigate('BatteryPerformance')}
                    />
                    <ListItem
                      title={'Battery Cycle Log'}
                      value={`${battery?.cycles.length.toString() || '0'} cycles`}
                      position={['last']}
                      rightContent={'chevron-right'}
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
                    ref={totalCyclesFieldRef}
                    title={'Total Cycles'}
                    position={['first', 'last']}
                    error={!!errors.totalCycles}
                    container={'right'}
                    inputProps={{
                      inputAccessoryViewID: 'keyboardAccessory',
                      onChangeText: (_, unformatted) =>
                        handleChange('totalCycles')(unformatted),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(
                          Fields.totalCycles,
                        ),
                      value: values.totalCycles,
                      mask: Masks.BATTERY_CYCLES,
                      rtlNumber: true,
                      placeholder: 'None',
                      keyboardType: 'number-pad',
                    }}
                  />
                )}
                <Divider />
                <ListItem
                  title={'Battery Tint'}
                  value={
                    <View style={s.tintValueContainer}>
                      {values.tint !== BatteryTint.None && (
                        <Circle
                          fill={batteryTintIconProps[values.tint]?.color}
                          color={theme.colors.transparent}
                          size={16}
                        />
                      )}
                      <Text style={s.tintValueText}>{values.tint}</Text>
                    </View>
                  }
                  rightContent={'chevron-right'}
                  position={['first']}
                  onPress={() =>
                    navigation.navigate('EnumPicker', {
                      title: 'Battery Tint',
                      values: Object.values(BatteryTint),
                      selected: values.tint,
                      icons: batteryTintIcons,
                      eventName: 'battery-tint',
                    })
                  }
                />
                <ListItem
                  title={'QR Code Size'}
                  value={values.scanCodeSize}
                  position={['last']}
                  rightContent={'chevron-right'}
                  onPress={() =>
                    navigation.navigate('EnumPicker', {
                      title: 'QR Code Size',
                      values: Object.values(ScanCodeSize),
                      selected: values.scanCodeSize,
                      eventName: 'battery-scan-code-size',
                    })
                  }
                />
                <Divider />
                <ListItemInput
                  ref={purchasePriceFieldRef}
                  title={'Purchase Price'}
                  error={!!errors.purchasePrice}
                  position={batteryId ? ['first'] : ['first', 'last']}
                  container={'right'}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: (_, unformatted) =>
                      handleChange('purchasePrice')(unformatted),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(
                        Fields.purchasePrice,
                      ),
                    value: values.purchasePrice,
                    mask: Masks.CURRENCY,
                    rtlNumber: true,
                    placeholder: 'Unknown',
                    keyboardType: 'number-pad',
                  }}
                />
                {batteryId && (
                  <>
                    <ListItem
                      title={'Operating Cost'}
                      value={`${operatingCost()} per cycle`}
                    />
                    <ListItemSwitch
                      title={'Battery is Retired'}
                      position={['last']}
                      value={values.retired}
                      onValueChange={value => setFieldValue('retired', value)}
                    />
                  </>
                )}
                <Divider />
                <ListItemNotes
                  notes={values.notes}
                  position={['first', 'last']}
                  onPress={() =>
                    navigation.navigate('NotesEditor', {
                      title: 'Battery Notes',
                      text: values.notes,
                      eventName: 'battery-notes',
                    })
                  }
                />
              </View>
            )}
          </Formik>
          {batteryId && (
            <>
              <Divider />
              <Button
                title={'Delete Battery'}
                titleStyle={theme.styles.buttonAssertiveTitle}
                buttonStyle={theme.styles.buttonAssertive}
                containerStyle={theme.styles.buttonContainer}
                outline
                onPress={() => {
                  confirmAction(
                    {
                      label: 'Delete Battery',
                      title:
                        'This action cannot be undone.\nAre you sure you want to delete this battery?',
                    },
                    deleteBattery,
                  );
                }}
              />
            </>
          )}
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
  batteryTint: {
    borderLeftWidth: 8,
  },
  tintValueContainer: {
    flexDirection: 'row',
    width: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tintValueText: {
    ...theme.text.normal,
    color: theme.colors.listItemValue,
    marginLeft: 5,
  },
}));

export default BatteryEditorScreen;
