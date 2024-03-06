import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemDate, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import { Model, ModelStatistics } from 'realmdb/Model';
import { ModelsNavigatorParamList, NewModelNavigatorParamList } from 'types/navigation';
import React, { useEffect, useState } from 'react';
import { eqArray, eqBoolean, eqNumber, eqObjectId, eqString, toNumber } from 'realmdb/helpers';
import { hmsMaskToSeconds, maskToHMS, secondsToMSS } from 'lib/formatters';
import { modelCostStatistics, modelEventOutcomeStatistics, useModelEventStyleStatistics } from 'lib/analytics';
import { modelHasPropeller, modelTypeIcons } from 'lib/model';
import { useObject, useQuery, useRealm } from '@realm/react';

import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import { BSON } from 'realm';
import { BatteryPickerResult } from 'components/BatteryPickerScreen';
import { ChecklistType } from 'types/checklist';
import { CollapsibleView } from 'components/atoms/CollapsibleView';
import { CompositeScreenProps } from '@react-navigation/core';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { EventStyle } from 'realmdb/EventStyle';
import { ModelCategory } from 'realmdb/ModelCategory';
import { ModelFuel } from 'realmdb/ModelFuel';
import { ModelHeader } from 'components/molecules/ModelHeader';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { ModelType } from 'types/model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { ScanCodeSize } from 'types/common';
import { View } from 'react-native';
import { eventKind } from 'lib/modelEvent';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useEvent } from 'lib/event';
import { useFocusEffect } from '@react-navigation/native';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<ModelsNavigatorParamList, 'ModelEditor'>,
  NativeStackScreenProps<NewModelNavigatorParamList, 'NewModel'>
>;

const ModelEditorScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const confirmAction = useConfirmAction();
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();
  const modelEventStyleStatistics = useModelEventStyleStatistics();

  const realm = useRealm();
  const model = useObject(Model, new BSON.ObjectId(modelId));
  const modelCategories = useQuery(ModelCategory);
  const modelPropellers = useQuery(ModelPropeller);
  const eventStyles = useQuery(EventStyle);
  const modelFuels = useQuery(ModelFuel);
  const [kind, setKind] = useState(eventKind(model?.type));

  const [name, setName] = useState(model?.name || undefined);
  const [image, setImage] = useState(model?.image || undefined);
  const [type, setType] = useState(model?.type || ModelType.Airplane);
  const [vendor, setVendor] = useState(model?.vendor || undefined);
  const [category, setCategory] = useState(model?.category || undefined);
  const [purchasePrice, setPurchasePrice] = useState(model?.purchasePrice?.toString() || undefined);
  const [damaged, setDamaged] = useState(model?.damaged || false);
  const [retired, setRetired] = useState(model?.retired || false);
  const [totalEvents, setTotalEvents] = useState(model?.statistics.totalEvents?.toString() || undefined);
  const [totalTime, setTotalTime] = useState(model?.statistics.totalTime?.toString() || undefined);
  const [lastEvent, setLastEvent] = useState(model?.lastEvent || undefined);
  const [logsBatteries, setLogsBatteries] = useState(model?.logsBatteries || false);
  const [favoriteBatteries, setFavoriteBatteries] = useState(model?.favoriteBatteries || []);
  const [logsFuel, setLogsFuel] = useState(model?.logsFuel || false);
  const [fuelCapacity, setFuelCapacity] = useState(model?.fuelCapacity?.toString() || undefined);
  const [totalFuel, setTotalFuel] = useState(model?.totalFuel?.toString() || undefined);
  const [defaultFuel, setDefaultFuel] = useState(model?.defaultFuel || undefined);
  const [defaultPropeller, setDefaultPropeller] = useState(model?.defaultPropeller || undefined);
  const [defaultStyle, setDefaultStyle] = useState(model?.defaultStyle || undefined);
  const [scanCodeSize, setScanCodeSize] = useState(model?.scanCodeSize || ScanCodeSize.None);
  const [notes, setNotes] = useState(model?.notes || undefined);

  const [completedMaintenanceActionsCount, setCompletedMaintenanceActionsCount] = useState(0);
  const [pendingMaintenanceActionsCount, setPendingMaintenanceActionsCount] = useState(0);

  const [expandedLastEvent, setExpandedLastEvent] = useState(false);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    setKind(eventKind(type));
  }, [type]);

  useEffect(() => {
    if (modelId) return;

    const canSave = !!name && (
      !eqString(model?.name, name) ||
      !eqString(model?.image, image) ||
      !eqString(model?.type, type) ||
      !eqString(model?.vendor, vendor) ||
      !eqObjectId(model?.category, category) ||
      !eqNumber(model?.purchasePrice, purchasePrice) ||
      !eqBoolean(model?.damaged, damaged) ||
      !eqBoolean(model?.retired, retired) ||
      !eqNumber(model?.statistics.totalEvents, totalEvents) ||
      !eqNumber(model?.statistics.totalTime, totalTime) ||
      !eqString(model?.lastEvent, lastEvent) ||
      !eqBoolean(model?.logsBatteries, logsBatteries) ||
      !eqArray(model?.favoriteBatteries, favoriteBatteries) ||
      !eqBoolean(model?.logsFuel, logsFuel) ||
      !eqNumber(model?.fuelCapacity, fuelCapacity) ||
      !eqNumber(model?.totalFuel, totalFuel) ||
      !eqObjectId(model?.defaultFuel, defaultFuel) ||
      !eqObjectId(model?.defaultPropeller, defaultPropeller) ||
      !eqObjectId(model?.defaultStyle, defaultStyle) ||
      !eqString(model?.scanCodeSize, scanCodeSize) ||
      !eqString(model?.notes, notes)
    );

    const save = () => {
      realm.write(() => {
        const now = DateTime.now().toISO()!;
        const numTotalEvents = toNumber(totalEvents) || 0;
        const numTotalTime = hmsMaskToSeconds(totalTime);

        const model = {
          createdOn: now,
          updatedOn: now,
          name,
          image,
          type,
          vendor,
          category,
          purchasePrice: toNumber(purchasePrice),
          retired,
          damaged,
          lastEvent,
          logsBatteries,
          favoriteBatteries,
          logsFuel,
          fuelCapacity: toNumber(fuelCapacity),
          totalFuel: toNumber(totalFuel),
          defaultFuel,
          defaultPropeller,
          defaultStyle,
          scanCodeSize,
          notes,
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
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader(
      {enabled: canSave, action: onDone},
      undefined,
      {title: 'New Model'},
    );
  }, [ 
    name,
    image,
    type,
    vendor,
    category,
    purchasePrice,
    retired,
    damaged,
    totalEvents,
    totalTime,
    lastEvent,
    logsBatteries,
    favoriteBatteries,
    logsFuel,
    fuelCapacity,
    totalFuel,
    defaultFuel,
    defaultPropeller,
    defaultStyle,
    scanCodeSize,
    notes,
  ]);

  useEffect(() => {
    if (!modelId || !model) return;

    const canSave = !!name && (
      !eqString(model?.name, name) ||
      !eqString(model?.image, image) ||
      !eqString(model?.vendor, vendor) ||
      !eqObjectId(model?.category, category) ||
      !eqNumber(model?.purchasePrice, purchasePrice) ||
      !eqBoolean(model?.damaged, damaged) ||
      !eqBoolean(model?.retired, retired) ||
      !eqBoolean(model?.logsBatteries, logsBatteries) ||
      !eqArray(model?.favoriteBatteries, favoriteBatteries) ||
      !eqBoolean(model?.logsFuel, logsFuel) ||
      !eqNumber(model?.fuelCapacity, fuelCapacity) ||
      !eqNumber(model?.totalFuel, totalFuel) ||
      !eqObjectId(model?.defaultFuel, defaultFuel) ||
      !eqObjectId(model?.defaultPropeller, defaultPropeller) ||
      !eqObjectId(model?.defaultStyle, defaultStyle) ||
      !eqString(model?.scanCodeSize, scanCodeSize) ||
      !eqString(model?.notes, notes)
    );

    if (canSave) {
      realm.write(() => {
        model.updatedOn = DateTime.now().toISO()!,
        model.name = name!;
        model.image = image;
        model.vendor = vendor;
        model.category = category;
        model.purchasePrice = toNumber(purchasePrice);
        model.retired = retired;
        model.damaged = damaged;
        model.logsBatteries = logsBatteries;
        model.favoriteBatteries = favoriteBatteries;
        model.logsFuel = logsFuel
        model.fuelCapacity = toNumber(fuelCapacity);
        model.totalFuel = toNumber(totalFuel);
        model.defaultFuel = defaultFuel;
        model.defaultPropeller = defaultPropeller;
        model.defaultStyle = defaultStyle;
        model.scanCodeSize = scanCodeSize;
        model.notes = notes;
        model.statistics = lodash.merge(model.statistics, modelCostStatistics(model));
      });
    }
  }, [ 
    name,
    image,
    vendor,
    category,
    purchasePrice,
    retired,
    damaged,
    logsBatteries,
    favoriteBatteries,
    logsFuel,
    fuelCapacity,
    totalFuel,
    defaultFuel,
    defaultPropeller,
    defaultStyle,
    scanCodeSize,
    notes,
  ]);

  useEffect(() => {
    if (!modelId) return;
    navigation.setOptions({
      header: () => (
        <ModelHeader
          modelId={route.params.modelId}
          onChangeImage={setImage}
          onGoBack={navigation.goBack}
          scrollY={scrollY}
        />
      ),
    });
  }, []);

  useFocusEffect(() => {
    let completedCount = 0;
    let pendingCount = 0;
    const maintenanceChecklists = model?.checklists.filter(c =>
      c.type === ChecklistType.Maintenance || c.type === ChecklistType.OneTimeMaintenance
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
      event.removeListener('model-favorite-batteries', onChangeFavoriteBatteries);
      event.removeListener('default-propeller', onChangeDefaultPropeller);
      event.removeListener('default-style', onChangeDefaultStyle);
      event.removeListener('default-fuel', onChangeDefaultFuel);
      event.removeListener('model-scan-code-size', onChangeScanCodeSize);
      event.removeListener('model-notes', onChangeNotes);
    };
  }, []);

  const onChangeType = (result: EnumPickerResult) => {
    setType(result.value[0] as ModelType);
  };

  const onChangeCategory = (result: EnumPickerResult) => {
    const c = modelCategories.find(c => {return c.name === result.value[0]});
    setCategory(c);
  };

  const onChangeFavoriteBatteries = (result: BatteryPickerResult) => {
    setFavoriteBatteries(result.batteries);
  };

  const onChangeDefaultPropeller = (result: EnumPickerResult) => {
    const p = modelPropellers.find(p => {return p.name === result.value[0]});
    setDefaultPropeller(p);
  };

  const onChangeDefaultStyle = (result: EnumPickerResult) => {
    const s = eventStyles.find(s => {return s.name === result.value[0]});
    setDefaultStyle(s);
  };

  const onChangeDefaultFuel = (result: EnumPickerResult) => {
    const f = modelFuels.find(f => {return f.name === result.value[0]});
    setDefaultFuel(f);
  };

  const onLastEventChange = (date?: Date) => {
    date && setLastEvent(DateTime.fromJSDate(date).toISO() || new Date().toISOString());
  };

  const onChangeScanCodeSize = (result: EnumPickerResult) => {
    setScanCodeSize(result.value[0] as ScanCodeSize);
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    setNotes(result.text);
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const confirmDeleteModel =() => {
    confirmAction(deleteModel, {
      label: `Delete ${model?.type}`,
      title: `This action cannot be undone.\nAre you sure you want to delete this ${model?.type.toLocaleLowerCase()}?`,
      value: model
    });
  };

  const deleteModel = () => {
    realm.write(() => {
      realm.delete(model);
    });
    navigation.goBack();
  };

  return (
    <AvoidSoftInputView>
      <Animated.ScrollView
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        {!modelId &&
          <ModelHeader
            modelId={route.params.modelId}
            onChangeImage={setImage}
          />
        }
        <View style={theme.styles.view}>
          {!!model && <Divider />}
          <Divider />
          <ListItemInput
            placeholder={'New Model'}
            placeholderTextColor={theme.colors.assertive}
            position={['first']}
            value={name}
            onChangeText={setName}
          />
          <ListItemInput
            placeholder={'Vendor'}
            position={['last']}
            value={vendor}
            onChangeText={setVendor}
          />
          <Divider />
          <CollapsibleView expanded={!modelId}>
            <ListItem
              title={'Model Type'}
              value={type}
              position={['first']}
              onPress={() => navigation.navigate('EnumPicker', {
                title: 'Model Type',
                headerBackTitle: 'Model',
                values: Object.values(ModelType),
                selected: type,
                icons: modelTypeIcons,
                eventName: 'model-type',
              })}
            />
          </CollapsibleView>
          <ListItem
            title={'Category'}
            value={category?.name || 'None'}
            position={modelId ? ['first', 'last'] : ['last']}
            onPress={() => navigation.navigate('EnumPicker', {
              title: 'Model Category',
              headerBackTitle: 'Model',
              footer: 'You can manage categories through the Globals section in the Setup tab.',
              values: modelCategories.map(c => { return c.name }),
              selected: category?.name,
              mode: 'one-or-none',
              eventName: 'model-category',
            })}
          />
          <CollapsibleView expanded={!modelId}>
            <Divider />
            <ListItemInput
              title={'Total Time'}
              value={totalTime}
              label='h:mm:ss'
              placeholder={'Unknown'}
              keyboardType={'number-pad'}
              numeric={true}
              numericProps={{
                precision: 0,
                maxValue: 999999,
                customFormatter: maskToHMS,
              }}
              position={['first']}
              onChangeText={value =>
                setTotalTime(hmsMaskToSeconds(value) > 0 ? value : undefined)
              }
            />
            <ListItemInput
              title={`Total ${kind.namePlural}`}
              value={totalEvents}
              label={`${kind.namePlural}`}
              placeholder={'No'}
              keyboardType={'number-pad'}
              numeric={true}
              numericProps={{precision: 0, prefix: ''}}
              onChangeText={setTotalEvents}
            />
          </CollapsibleView>
          {!!modelId &&
            <>
              <Divider text={kind.namePlural.toUpperCase()}/>
              <ListItem
                title={'Statistics'}
                value={`${secondsToMSS(model?.statistics.totalTime, {format: 'm:ss'})} in ${model?.statistics.totalEvents} ${eventKind(model?.type).namePlural.toLowerCase()}`}
                position={['first']}
                onPress={() => navigation.navigate('ModelStatistics', {
                  modelId,
                })}
              />
            </>
          }
          {!modelId &&
            <ListItemDate
              title={`Last ${kind.name}`}
              value={lastEvent
                ? DateTime.fromISO(lastEvent).toFormat("MMM d, yyyy 'at' h:mm a")
                : 'Tap to Set...'}
              pickerValue={lastEvent}
              rightImage={false}
              expanded={expandedLastEvent}
              position={modelId ? [] : ['last']}
              onPress={() => setExpandedLastEvent(!expandedLastEvent)}
              onDateChange={onLastEventChange}
            />
          }
          {!!modelId &&
            <>
              <ListItem
                title={`Last ${kind.name}`}
                value={lastEvent
                  ? DateTime.fromISO(lastEvent).toFormat("MMM d, yyyy 'at' h:mm a")
                  : 'Unknown'
                }
                rightImage={false}
              />
              <ListItem
                title={`${kind.name} Log`}
                value={`${model?.events.length || 0} ${kind.namePlural.toLowerCase()}`}
                position={['last']}
                onPress={() => navigation.navigate('Events', {
                  modelId,
                })}
              />
            </>
          }
          {!!modelId &&
            <>
              <Divider text={'MAINTENANCE'}/>
              <ListItem
                title={'Checklists'}
                value={`${model?.checklists.length || 0}`}
                position={['first']}
                onPress={() => navigation.navigate('ModelChecklists', {
                  modelId,
                })}
              />
              <ListItem
                title={'Perform Maintenance'}
                value={`${pendingMaintenanceActionsCount} pending`}
                onPress={() => navigation.navigate('ModelMaintenance', {
                  modelId,
                })}
              />
              <ListItem
                title={'Maintenance Log'}
                value={`${completedMaintenanceActionsCount} entries`}
                position={['last']}
                onPress={() => navigation.navigate('ModelMaintenanceHistory', {
                  modelId,
                })}
              />
            </>
          }
          <Divider />
          <ListItemSwitch
            title={'Battery Logging'}
            value={logsBatteries}
            position={['first']}
            onValueChange={setLogsBatteries}
            expanded={logsBatteries}
            ExpandableComponent={
              <ListItem
                title={'Favorite Batteries'}
                value={`${favoriteBatteries.length}`}
                onPress={() => navigation.navigate('BatteryPicker', {
                  title: 'Favorite Batteries',
                  backTitle: 'Model',
                  selected: favoriteBatteries,
                  mode: 'many',
                  eventName: 'model-favorite-batteries',
                })}
              />
            }
          />
          <ListItemSwitch
            title={'Fuel Logging'}
            position={logsFuel ? [] : ['last']}
            value={logsFuel}
            onValueChange={setLogsFuel}
            expanded={logsFuel}
            ExpandableComponent={
              <>
                <ListItemInput
                  title={'Fuel Capacity'}
                  value={fuelCapacity}
                  label='oz'
                  placeholder={'Value'}
                  numeric={true}
                  numericProps={{precision: 2, prefix: ''}}
                  keyboardType={'number-pad'}
                  onChangeText={setFuelCapacity}
                />
                <ListItemInput
                  title={'Total Fuel Consumed'}
                  value={totalFuel}
                  label='gal'
                  placeholder={'Amount'}
                  numeric={true}
                  numericProps={{precision: 2, prefix: ''}}
                  position={['last']}
                  keyboardType={'number-pad'}
                  onChangeText={setTotalFuel}
                />
              </>
            }
          />
          <Divider />
          <ListItem
            title={'Default Style'}
            value={defaultStyle?.name || 'None'}
            position={!modelHasPropeller(type) && !logsFuel ? ['first', 'last'] : ['first']}
            onPress={() => navigation.navigate('EnumPicker', {
              title: 'Default Style',
              headerBackTitle: 'Model',
              footer: 'You can manage styles through the Globals section in the Setup tab.',
              values: eventStyles.map(s => { return s.name }),
              selected: defaultStyle?.name,
              mode: 'one-or-none',
              eventName: 'default-style',
            })}
          />
          {modelHasPropeller(type) &&
            <ListItem
              title={'Default Propeller'}
              value={defaultPropeller?.name || 'None'}
              position={!logsFuel ? ['last']: []}
              onPress={() => navigation.navigate('EnumPicker', {
                title: 'Default Propeller',
                headerBackTitle: 'Model',
                footer: 'You can manage propellers through the Globals section in the Setup tab.',
                values: modelPropellers.map(p => { return p.name}),
                selected: defaultPropeller?.name,
                mode: 'one-or-none',
                eventName: 'default-propeller',
              })}
            />
          }
          <CollapsibleView expanded={logsFuel}>
            <ListItem
              title={'Default Fuel'}
              value={defaultFuel?.name || 'None'}
              position={['last']}
              onPress={() => navigation.navigate('EnumPicker', {
                title: 'Default Fuel',
                headerBackTitle: 'Model',
                footer: 'You can manage fuel through the Globals section in the Setup tab.',
                values: modelFuels.map(f => { return f.name}),
                selected: defaultFuel?.name,
                mode: 'one-or-none',
                eventName: 'default-fuel',
              })}
            />
          </CollapsibleView>
          <Divider />
          <ListItem
            title={'QR Code Size'}
            value={scanCodeSize || 'None'}
            position={['first', 'last']}
            onPress={() => navigation.navigate('EnumPicker', {
              title: 'QR Code Size',
              headerBackTitle: 'Model',
              values: Object.values(ScanCodeSize),
              selected: scanCodeSize,
              eventName: 'model-scan-code-size',
            })}
          />
          <Divider />
          <ListItemInput
            title={'Purchase Price'}
            value={purchasePrice}
            numeric={true}
            numericProps={{maxValue: 99999}}
            keyboardType={'number-pad'}
            placeholder={'Unknown'}
            position={['first']}
            onChangeText={setPurchasePrice}
          /> 
          {!!modelId &&
            <ListItemSwitch
              title={`${type} is Retired`}
              value={retired}
              onValueChange={setRetired}
            />
          }
          <ListItemSwitch
            title={`${type} is Damaged`}
            position={['last']}
            value={damaged}
            onValueChange={setDamaged}
          />
          <Divider />
          <ListItem
            title={notes || 'Notes'}
            position={['first', 'last']}
            onPress={() => navigation.navigate('NotesEditor', {
              title: 'Model Notes',
              text: notes,
              eventName: 'model-notes',
            })}
          />
          <Divider text={'DANGER ZONE'} />
          <ListItem
            title={`Delete ${model?.type}`}
            titleStyle={s.delete}
            position={['first', 'last']}
            rightImage={false}
            onPress={confirmDeleteModel}
          />
          <Divider />
        </View>
      </Animated.ScrollView>
    </AvoidSoftInputView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  delete: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.assertive,
  },
}));

export default ModelEditorScreen;
