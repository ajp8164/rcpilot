import * as Yup from 'yup';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItemInputMethods,
} from '@react-native-hello/ui';
import {
  CollapsibleView,
  ListItem,
  ListItemDateTime,
  ListItemSwitch,
  ListItemSwitchCollapsible,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useQuery, useRealm } from '@realm/react';
import { BatteryPickerResult } from 'components/BatteryPickerScreen';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemNotes } from 'components/atoms/List';
import { ModelHeader } from 'components/molecules/ModelHeader';
import { Formik, FormikProps } from 'formik';
import {
  modelCostStatistics,
  modelEventOutcomeStatistics,
  useModelEventStyleStatistics,
} from 'lib/analytics';
import { useEvent } from 'lib/event';
import { hmsMaskToSeconds, secondsToFormat } from 'lib/formatters';
import { Masks } from 'lib/inputMasks';
import { modelHasPropeller, modelTypeIcons } from 'lib/model';
import { eventKind } from 'lib/modelEvent';
import { useConfirmAction } from 'lib/useConfirmAction';
import lodash from 'lodash';
import { DateTime } from 'luxon';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { BSON } from 'realm';
import { Battery, toPlainArray } from 'realmdb';
import { EventStyle } from 'realmdb/EventStyle';
import { Model, ModelStatistics } from 'realmdb/Model';
import { ModelCategory } from 'realmdb/ModelCategory';
import { ModelFuel } from 'realmdb/ModelFuel';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { toNumber } from 'realmdb/helpers';
import { deleteModelPreferences } from 'store/slices/appSettings';
import { useTheme } from 'theme';
import { ChecklistType } from 'types/checklist';
import { ScanCodeSize } from 'types/common';
import { FilterType } from 'types/filter';
import { ModelType } from 'types/model';
import {
  ModelsNavigatorParamList,
  NewModelNavigatorParamList,
} from 'types/navigation';

// Order of fields for accessory view.
enum Fields {
  name,
  vendor,
  purchasePrice,
  fuelCapacity,
  totalFuelConsumed,
  totalTime,
  totalEvents,
}

type FormValues = {
  name: string;
  image?: string;
  type: ModelType;
  vendor: string;
  category?: ModelCategory;
  purchasePrice: string;
  damaged: boolean;
  retired: boolean;
  totalEvents: string;
  totalTime: string;
  lastEvent: string;
  logsBatteries: boolean;
  favoriteBatteries: Battery[];
  logsFuel: boolean;
  fuelCapacity: string;
  totalFuelConsumed: string;
  defaultFuel?: ModelFuel;
  defaultPropeller?: ModelPropeller;
  defaultStyle?: EventStyle;
  scanCodeSize: ScanCodeSize;
  notes: string;
  statistics: ModelStatistics;
};

export type Props = CompositeScreenProps<
  NativeStackScreenProps<ModelsNavigatorParamList, 'ModelEditor'>,
  NativeStackScreenProps<NewModelNavigatorParamList, 'NewModel'>
>;

const ModelEditorScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const dispatch = useDispatch();
  const confirmAction = useConfirmAction();
  const event = useEvent();
  const modelEventStyleStatistics = useModelEventStyleStatistics();

  const realm = useRealm();
  const model = useObject(Model, new BSON.ObjectId(modelId));
  const modelCategories = useQuery(ModelCategory);
  const modelPropellers = useQuery(ModelPropeller);
  const eventStyles = useQuery(EventStyle);
  const modelFuels = useQuery(ModelFuel);
  const [kind, setKind] = useState(
    eventKind(model?.type || ModelType.Airplane),
  );

  const [
    completedMaintenanceActionsCount,
    setCompletedMaintenanceActionsCount,
  ] = useState(0);
  const [pendingMaintenanceActionsCount, setPendingMaintenanceActionsCount] =
    useState(0);

  const [expandedLastEvent, setExpandedLastEvent] = useState(false);
  const scrollY = useSharedValue(0);

  const initialValues = {
    name: model?.name || '',
    image: model?.image || undefined,
    type: model?.type || ModelType.Airplane,
    vendor: model?.vendor || '',
    category: model?.category || undefined,
    purchasePrice: model?.purchasePrice?.toString() || '',
    damaged: model?.damaged || false,
    retired: model?.retired || false,
    totalEvents: model?.statistics.totalEvents?.toString() || '',
    totalTime: model?.statistics.totalTime?.toString() || '',
    lastEvent: model?.lastEvent || '',
    logsBatteries: model?.logsBatteries || false,
    // Don't send realm objects into formik. Object serialization will fail.
    favoriteBatteries: toPlainArray<Battery>(model?.favoriteBatteries),
    logsFuel: model?.logsFuel || false,
    fuelCapacity: model?.fuelCapacity?.toString() || '',
    totalFuelConsumed: model?.totalFuelConsumed?.toString() || '',
    defaultFuel: model?.defaultFuel || undefined,
    defaultPropeller: model?.defaultPropeller || undefined,
    defaultStyle: model?.defaultStyle || undefined,
    scanCodeSize: model?.scanCodeSize || ScanCodeSize.None,
    notes: model?.notes || '',
    statistics: {},
  } as FormValues;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    image: Yup.string(),
    type: Yup.string().required(),
    vendor: Yup.string(),
    category: Yup.object(),
    purchasePrice: Yup.string(),
    damaged: Yup.boolean(),
    retired: Yup.boolean(),
    totalEvents: Yup.string(),
    totalTime: Yup.string(),
    lastEvent: Yup.string(),
    logsBatteries: Yup.boolean(),
    favoriteBatteries: Yup.array().of(Yup.object()),
    logsFuel: Yup.boolean(),
    fuelCapacity: Yup.string(),
    totalFuelConsumed: Yup.string(),
    defaultFuel: Yup.object(),
    defaultPropeller: Yup.object(),
    defaultStyle: Yup.object(),
    scanCodeSize: Yup.string(),
    notes: Yup.string(),
    statistics: Yup.object(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);
  const vendorFieldRef = useRef<ListItemInputMethods>(null);

  const totalTimeFieldRef = useRef<ListItemInputMethods>(null);
  const totalEventsFieldRef = useRef<ListItemInputMethods>(null);
  const fuelCapacityFieldRef = useRef<ListItemInputMethods>(null);
  const totalFuelConsumedFieldRef = useRef<ListItemInputMethods>(null);
  const purchasePriceFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [
        nameFieldRef.current,
        vendorFieldRef.current,
        totalTimeFieldRef.current,
        totalEventsFieldRef.current,
        fuelCapacityFieldRef.current,
        totalFuelConsumedFieldRef.current,
        purchasePriceFieldRef.current,
      ].filter(Boolean),
    );
  }, []);

  useEffect(() => {
    if (!modelId) return;

    navigation.setOptions({
      header: () => (
        <ModelHeader
          navHeader
          modelId={modelId}
          modelType={formikRef.current?.values.type}
          onChangeImage={image =>
            formikRef.current?.setFieldValue('image', image)
          }
          onGoBack={navigation.goBack}
          scrollY={scrollY}
        />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);

  useFocusEffect(() => {
    let completedCount = 0;
    let pendingCount = 0;
    const maintenanceChecklists = model?.checklists.filter(
      c =>
        c.type === ChecklistType.Maintenance ||
        c.type === ChecklistType.OneTimeMaintenance,
    );
    maintenanceChecklists?.forEach(c => {
      c.actions.forEach(a => {
        if (a.schedule.state.due.now) {
          pendingCount++;
        }
        completedCount = completedCount + a.history.length;
      });
    });

    setCompletedMaintenanceActionsCount(completedCount);
    setPendingMaintenanceActionsCount(pendingCount);
  });

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('model-type', onChangeType);
    event.on('model-category', onChangeCategory);
    event.on('model-favorite-batteries', onChangeFavoriteBatteries);
    event.on('default-propeller', onChangeDefaultPropeller);
    event.on('default-style', onChangeDefaultStyle);
    event.on('default-fuel', onChangeDefaultFuel);
    event.on('model-scan-code-size', onChangeScanCodeSize);
    event.on('model-notes', onChangeNotes);

    return () => {
      event.removeListener('model-type', onChangeType);
      event.removeListener('model-category', onChangeCategory);
      event.removeListener(
        'model-favorite-batteries',
        onChangeFavoriteBatteries,
      );
      event.removeListener('default-propeller', onChangeDefaultPropeller);
      event.removeListener('default-style', onChangeDefaultStyle);
      event.removeListener('default-fuel', onChangeDefaultFuel);
      event.removeListener('model-scan-code-size', onChangeScanCodeSize);
      event.removeListener('model-notes', onChangeNotes);
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

    // Rehydrate realm objects.
    const ids = values.favoriteBatteries.map(b => b._id.toString());
    const favoriteBatteries = realm
      .objects(Battery)
      .filter(b => ids.includes(b._id.toString()));

    if (model) {
      realm.write(() => {
        model.updatedOn = now;
        model.name = values.name || 'no-name';
        model.image = values.image;
        model.vendor = values.vendor;
        model.category = values.category;
        model.purchasePrice = toNumber(values.purchasePrice);
        model.retired = values.retired;
        model.damaged = values.damaged;
        model.logsBatteries = values.logsBatteries;
        model.favoriteBatteries = favoriteBatteries;
        model.logsFuel = values.logsFuel;
        model.fuelCapacity = toNumber(values.fuelCapacity);
        model.totalFuelConsumed = toNumber(values.totalFuelConsumed);
        model.defaultFuel = values.defaultFuel;
        model.defaultPropeller = values.defaultPropeller;
        model.defaultStyle = values.defaultStyle;
        model.scanCodeSize = values.scanCodeSize;
        model.notes = values.notes;
        model.statistics = lodash.merge(
          model.statistics,
          modelCostStatistics(model),
        );
      });
    } else {
      realm.write(() => {
        const now = DateTime.now().toISO();
        const numTotalEvents = toNumber(values.totalEvents) || 0;
        const numTotalTime = hmsMaskToSeconds(values.totalTime);

        const model = {
          createdOn: now,
          updatedOn: now,
          name: values.name,
          image: values.image,
          type: values.type,
          vendor: values.vendor,
          category: values.category,
          purchasePrice: toNumber(values.purchasePrice),
          retired: values.retired,
          damaged: values.damaged,
          lastEvent: values.lastEvent,
          logsBatteries: values.logsBatteries,
          favoriteBatteries,
          logsFuel: values.logsFuel,
          fuelCapacity: toNumber(values.fuelCapacity),
          totalFuelConsumed: toNumber(values.totalFuelConsumed),
          defaultFuel: values.defaultFuel,
          defaultPropeller: values.defaultPropeller,
          defaultStyle: values.defaultStyle,
          scanCodeSize: values.scanCodeSize,
          notes: values.notes,
          statistics: {},
        } as Model;

        model.statistics = {
          ...modelCostStatistics(model),
          ...modelEventOutcomeStatistics(model, undefined),
          eventStyleData: modelEventStyleStatistics('init', model, 0),
          totalEvents: numTotalEvents,
          totalTime: numTotalTime,
        } as ModelStatistics;

        realm.create('Model', model);
      });
    }
  };

  const onChangeType = (result: EnumPickerResult) => {
    const type = result.value[0] as ModelType;
    formikRef.current?.setFieldValue('type', type);
    setKind(eventKind(type));
  };

  const onChangeCategory = (result: EnumPickerResult) => {
    const c = modelCategories.find(c => {
      return c.name === result.value[0];
    });
    formikRef.current?.setFieldValue('category', c);
  };

  const onChangeFavoriteBatteries = (result: BatteryPickerResult) => {
    formikRef.current?.setFieldValue(
      'favoriteBatteries',
      toPlainArray<Battery>(result.batteries),
    );
  };

  const onChangeDefaultPropeller = (result: EnumPickerResult) => {
    const p = modelPropellers.find(p => {
      return p.name === result.value[0];
    });
    formikRef.current?.setFieldValue('defaultPropeller', p);
  };

  const onChangeDefaultStyle = (result: EnumPickerResult) => {
    const s = eventStyles.find(s => {
      return s.name === result.value[0];
    });
    formikRef.current?.setFieldValue('defaultStyle', s);
  };

  const onChangeDefaultFuel = (result: EnumPickerResult) => {
    const f = modelFuels.find(f => {
      return f.name === result.value[0];
    });
    formikRef.current?.setFieldValue('defaultFuel', f);
  };

  const onLastEventChange = (date?: Date) => {
    formikRef.current?.setFieldValue(
      'lastEvent',
      date ? DateTime.fromJSDate(date).toISO() : new Date().toISOString(),
    );
  };

  const onChangeScanCodeSize = (result: EnumPickerResult) => {
    formikRef.current?.setFieldValue('scanCodeSize', result.value[0]);
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    formikRef.current?.setFieldValue('notes', result.text);
  };

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const deleteModel = () => {
    // Cleanup model preferences.
    dispatch(deleteModelPreferences({ modelId }));

    realm.write(() => {
      realm.delete(model);
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

    // Auto submit the form when updating an existing model.
    if (model?._id && canSubmit) {
      formikRef.current?.handleSubmit();
    }

    navigation.setOptions({
      title: model ? formikRef.current?.values.type || 'Model' : 'New Model',
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
      <AvoidSoftInputView style={{ flex: 1 }}>
        <Animated.ScrollView
          onScroll={scrollHandler}
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
                {!modelId && (
                  <>
                    <ModelHeader
                      modelId={modelId}
                      modelType={values.type}
                      onChangeImage={image => setFieldValue('image', image)}
                    />
                    <Divider />
                  </>
                )}
                <View style={theme.styles.view}>
                  {!!model && <Divider />}
                  <Divider />
                  <ListItemInput
                    ref={nameFieldRef}
                    position={['first']}
                    error={!!errors.name}
                    inputProps={{
                      label: 'Model Name',
                      inputAccessoryViewID: 'keyboardAccessory',
                      onChangeText: handleChange('name'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(Fields.name),
                      value: values.name,
                      placeholder: 'Model Name',
                      autoCapitalize: 'words',
                    }}
                  />
                  <ListItemInput
                    ref={vendorFieldRef}
                    position={['last']}
                    error={!!errors.vendor}
                    inputProps={{
                      label: 'Vendor',
                      inputAccessoryViewID: 'keyboardAccessory',
                      onChangeText: handleChange('vendor'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(Fields.vendor),
                      value: values.vendor,
                      placeholder: 'Vendor',
                      autoCapitalize: 'words',
                    }}
                  />
                  <Divider />
                  <CollapsibleView expanded={!modelId}>
                    <ListItem
                      title={'Model Type'}
                      value={values.type}
                      position={['first']}
                      rightContent={'chevron-right'}
                      onPress={() =>
                        navigation.navigate('EnumPicker', {
                          title: 'Model Type',
                          headerBackTitle: 'Model',
                          values: Object.values(ModelType),
                          selected: values.type,
                          icons: modelTypeIcons,
                          eventName: 'model-type',
                        })
                      }
                    />
                  </CollapsibleView>
                  <ListItem
                    title={'Category'}
                    value={values.category?.name || 'None'}
                    position={modelId ? ['first', 'last'] : ['last']}
                    rightContent={'chevron-right'}
                    onPress={() =>
                      navigation.navigate('EnumPicker', {
                        enumName: 'ModelCategory',
                        title: 'Model Category',
                        headerBackTitle: 'Model',
                        footer:
                          'You can manage categories through the Globals section in the Setup tab.',
                        values: modelCategories.map(c => {
                          return c.name;
                        }),
                        selected: values.category?.name,
                        mode: 'one-or-none',
                        eventName: 'model-category',
                      })
                    }
                  />
                  <CollapsibleView expanded={!modelId}>
                    <Divider />
                    <ListItemInput
                      ref={totalTimeFieldRef}
                      title={'Total Time'}
                      position={['first']}
                      error={!!errors.totalTime}
                      units={'h:mm'}
                      container={'right'}
                      inputProps={{
                        inputAccessoryViewID: 'keyboardAccessory',
                        onChangeText: (_, unformatted) =>
                          handleChange('totalTime')(unformatted),
                        onFocus: () =>
                          keyboardAccessory.current?.focusedField(
                            Fields.totalTime,
                          ),
                        value: values.totalTime,
                        mask: Masks.HOURS_MINUTES,
                        delimiter: '',
                        rtlNumber: true,
                        placeholder: '0:00',
                        keyboardType: 'number-pad',
                      }}
                    />
                    <ListItemInput
                      ref={totalEventsFieldRef}
                      title={`Total ${kind.namePlural}`}
                      position={['first']}
                      error={!!errors.totalEvents}
                      units={kind.namePlural}
                      container={'right'}
                      inputProps={{
                        inputAccessoryViewID: 'keyboardAccessory',
                        onChangeText: (_, unformatted) =>
                          handleChange('totalEvents')(unformatted),
                        onFocus: () =>
                          keyboardAccessory.current?.focusedField(
                            Fields.totalEvents,
                          ),
                        value: values.totalEvents,
                        mask: '00000',
                        delimiter: '',
                        rtlNumber: true,
                        placeholder: '0',
                        keyboardType: 'number-pad',
                      }}
                    />
                  </CollapsibleView>
                  {!!modelId && (
                    <>
                      <Divider text={kind.namePlural.toUpperCase()} />
                      <ListItem
                        title={'Statistics'}
                        value={`${secondsToFormat(model?.statistics.totalTime, { format: "h'h' m'm'" })} in ${model?.statistics.totalEvents} ${eventKind(model?.type).namePlural.toLowerCase()}`}
                        position={['first']}
                        rightContent={'chevron-right'}
                        onPress={() =>
                          navigation.navigate('ModelStatistics', {
                            modelId,
                          })
                        }
                      />
                    </>
                  )}
                  {!modelId && (
                    <ListItemDateTime
                      title={`Last ${kind.name}`}
                      value={
                        values.lastEvent
                          ? DateTime.fromISO(values.lastEvent).toFormat(
                              "MMM d, yyyy 'at' h:mm a",
                            )
                          : 'Tap to Set...'
                      }
                      pickerValue={values.lastEvent}
                      expanded={expandedLastEvent}
                      position={modelId ? [] : ['last']}
                      onPress={() => setExpandedLastEvent(!expandedLastEvent)}
                      onChange={onLastEventChange}
                    />
                  )}
                  {!!modelId && (
                    <>
                      <ListItem
                        title={`Last ${kind.name}`}
                        value={
                          values.lastEvent
                            ? DateTime.fromISO(values.lastEvent).toFormat(
                                "MMM d, yyyy 'at' h:mm a",
                              )
                            : 'Unknown'
                        }
                      />
                      <ListItem
                        title={`${kind.name} Log`}
                        value={`${model?.events.length || 0} ${kind.namePlural.toLowerCase()}`}
                        position={['last']}
                        rightContent={'chevron-right'}
                        onPress={() =>
                          navigation.navigate('Events', {
                            filterType: FilterType.EventsModelFilter,
                            modelId,
                          })
                        }
                      />
                    </>
                  )}
                  {!!modelId && (
                    <>
                      <Divider text={'MAINTENANCE'} />
                      <ListItem
                        title={'Checklists'}
                        value={`${model?.checklists.length || 0}`}
                        position={['first']}
                        rightContent={'chevron-right'}
                        onPress={() =>
                          navigation.navigate('ModelChecklists', {
                            modelId,
                          })
                        }
                      />
                      <ListItem
                        title={'Perform Maintenance'}
                        value={`${pendingMaintenanceActionsCount} pending`}
                        rightContent={'chevron-right'}
                        onPress={() =>
                          navigation.navigate('Maintenance', {
                            modelId,
                          })
                        }
                      />
                      <ListItem
                        title={'Maintenance Log'}
                        value={`${completedMaintenanceActionsCount} entries`}
                        rightContent={'chevron-right'}
                        position={['last']}
                        onPress={() =>
                          navigation.navigate('MaintenanceHistory', {
                            modelId,
                          })
                        }
                      />
                    </>
                  )}
                  <Divider />
                  <ListItemSwitchCollapsible
                    title={'Battery Logging'}
                    value={values.logsBatteries}
                    position={['first']}
                    onValueChange={value => {
                      setFieldValue('logsBatteries', value);
                      // Remove batteries if not logging batteries.
                      if (!value) {
                        setFieldValue('favoriteBatteries', []);
                      }
                    }}
                    expanded={values.logsBatteries}>
                    <ListItem
                      title={'Favorite Batteries'}
                      rightContent={'chevron-right'}
                      value={`${values.favoriteBatteries.length}`}
                      onPress={() =>
                        navigation.navigate('BatteryPicker', {
                          title: 'Favorite Batteries',
                          backTitle: 'Model',
                          selected: values.favoriteBatteries,
                          mode: 'many',
                          eventName: 'model-favorite-batteries',
                        })
                      }
                    />
                  </ListItemSwitchCollapsible>
                  <ListItemSwitchCollapsible
                    title={'Fuel Logging'}
                    position={values.logsFuel ? [] : ['last']}
                    value={values.logsFuel}
                    onValueChange={value => setFieldValue('logsFuel', value)}
                    expanded={values.logsFuel}>
                    <>
                      <ListItemInput
                        ref={fuelCapacityFieldRef}
                        title={'Fuel Capacity'}
                        error={!!errors.fuelCapacity}
                        units={'oz'}
                        container={'right'}
                        inputProps={{
                          inputAccessoryViewID: 'keyboardAccessory',
                          onChangeText: (_, unformatted) =>
                            handleChange('fuelCapacity')(unformatted),
                          onFocus: () =>
                            keyboardAccessory.current?.focusedField(
                              Fields.fuelCapacity,
                            ),
                          value: values.fuelCapacity,
                          mask: Masks.OUNCES,
                          delimiter: '',
                          rtlNumber: true,
                          placeholder: '0.00',
                          keyboardType: 'number-pad',
                        }}
                      />
                      <ListItemInput
                        ref={totalFuelConsumedFieldRef}
                        title={'Total Fuel Consumed'}
                        error={!!errors.totalFuelConsumed}
                        units={'gal'}
                        disabled
                        position={['last']}
                        container={'right'}
                        inputProps={{
                          editable: !model?._id,
                          inputAccessoryViewID: 'keyboardAccessory',
                          onChangeText: (_, unformatted) =>
                            handleChange('totalFuelConsumed')(unformatted),
                          onFocus: () =>
                            keyboardAccessory.current?.focusedField(
                              Fields.totalFuelConsumed,
                            ),
                          value: values.totalFuelConsumed,
                          mask: Masks.GALLONS,
                          delimiter: '',
                          rtlNumber: true,
                          placeholder: '0.00',
                          keyboardType: 'number-pad',
                        }}
                      />
                    </>
                  </ListItemSwitchCollapsible>
                  <Divider />
                  <ListItem
                    title={'Default Style'}
                    value={values.defaultStyle?.name || 'None'}
                    position={
                      !modelHasPropeller(values.type) && !values.logsFuel
                        ? ['first', 'last']
                        : ['first']
                    }
                    rightContent={'chevron-right'}
                    onPress={() =>
                      navigation.navigate('EnumPicker', {
                        enumName: 'EventStyle',
                        title: 'Default Style',
                        headerBackTitle: 'Model',
                        footer:
                          'You can manage styles through the Globals section in the Setup tab.',
                        values: eventStyles.map(s => {
                          return s.name;
                        }),
                        selected: values.defaultStyle?.name,
                        mode: 'one-or-none',
                        eventName: 'default-style',
                      })
                    }
                  />
                  {modelHasPropeller(values.type) && (
                    <ListItem
                      title={'Default Propeller'}
                      value={values.defaultPropeller?.name || 'None'}
                      position={!values.logsFuel ? ['last'] : []}
                      rightContent={'chevron-right'}
                      onPress={() =>
                        navigation.navigate('EnumPicker', {
                          enumName: 'ModelPropeller',
                          title: 'Default Propeller',
                          headerBackTitle: 'Model',
                          footer:
                            'You can manage propellers through the Globals section in the Setup tab.',
                          values: modelPropellers.map(p => {
                            return p.name;
                          }),
                          selected: values.defaultPropeller?.name,
                          mode: 'one-or-none',
                          eventName: 'default-propeller',
                        })
                      }
                    />
                  )}
                  <CollapsibleView expanded={values.logsFuel}>
                    <ListItem
                      title={'Default Fuel'}
                      value={values.defaultFuel?.name || 'None'}
                      position={['last']}
                      rightContent={'chevron-right'}
                      onPress={() =>
                        navigation.navigate('EnumPicker', {
                          enumName: 'ModelFuel',
                          title: 'Default Fuel',
                          headerBackTitle: 'Model',
                          footer:
                            'You can manage fuel through the Globals section in the Setup tab.',
                          values: modelFuels.map(f => {
                            return f.name;
                          }),
                          selected: values.defaultFuel?.name,
                          mode: 'one-or-none',
                          eventName: 'default-fuel',
                        })
                      }
                    />
                  </CollapsibleView>
                  <Divider />
                  <ListItem
                    title={'QR Code Size'}
                    value={values.scanCodeSize || 'None'}
                    position={['first', 'last']}
                    rightContent={'chevron-right'}
                    onPress={() =>
                      navigation.navigate('EnumPicker', {
                        title: 'QR Code Size',
                        headerBackTitle: 'Model',
                        values: Object.values(ScanCodeSize),
                        selected: values.scanCodeSize,
                        eventName: 'model-scan-code-size',
                      })
                    }
                  />
                  <Divider />
                  <ListItemInput
                    ref={purchasePriceFieldRef}
                    title={'Purchase Price'}
                    error={!!errors.purchasePrice}
                    position={['first']}
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
                  <ListItemSwitch
                    title={`${values.type} is Retired`}
                    value={values.retired}
                    onValueChange={value => setFieldValue('retired', value)}
                  />
                  {!!modelId && (
                    <ListItemSwitch
                      title={`${values.type} is Damaged`}
                      position={['last']}
                      value={values.damaged}
                      onValueChange={value => setFieldValue('damaged', value)}
                    />
                  )}
                  <Divider />
                  <ListItemNotes
                    notes={values.notes}
                    position={['first', 'last']}
                    onPress={() =>
                      navigation.navigate('NotesEditor', {
                        title: 'Model Notes',
                        text: values.notes,
                        eventName: 'model-notes',
                      })
                    }
                  />
                  {modelId && (
                    <>
                      <Divider />
                      <Button
                        title={`Delete ${model?.type}`}
                        titleStyle={theme.styles.buttonAssertiveTitle}
                        buttonStyle={theme.styles.buttonAssertive}
                        containerStyle={theme.styles.buttonContainer}
                        outline
                        onPress={() => {
                          confirmAction(
                            {
                              label: `Delete ${model?.type}`,
                              title: `This action cannot be undone.\nAre you sure you want to delete this ${model?.type.toLocaleLowerCase()}?`,
                            },
                            deleteModel,
                          );
                        }}
                      />
                      <Divider />
                    </>
                  )}
                </View>
              </View>
            )}
          </Formik>
        </Animated.ScrollView>
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

export default ModelEditorScreen;
