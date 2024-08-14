import { AppTheme, useTheme } from 'theme';
import { BatteryCycle, JBatteryDischarge, JBatteryDischargeValues } from 'realmdb/BatteryCycle';
import { ChecklistActionHistoryEntry, JChecklistAction } from 'realmdb/Checklist';
import { ChecklistType, EventSequenceChecklistType } from 'types/checklist';
import { Divider, getColoredSvg } from '@react-native-ajp-elements/ui';
import { FlatList, Image, ListRenderItem, ScrollView, View } from 'react-native';
import { ListItem, ListItemInput } from 'components/atoms/List';
import { MSSToSeconds, secondsToMSS } from 'lib/formatters';
import { Model, ModelStatistics } from 'realmdb/Model';
import React, { useEffect, useRef, useState } from 'react';
import { eventKind, eventOutcomeIcons } from 'lib/modelEvent';
import {
  modelCostStatistics,
  modelEventOutcomeStatistics,
  useModelEventStyleStatistics,
} from 'lib/analytics';
import { modelHasPropeller, modelSummary, modelTypeIcons } from 'lib/model';
import { useDispatch, useSelector } from 'react-redux';
import { useObject, useQuery, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { BatteryCellValuesEditorResult } from 'components/BatteryCellValuesEditorScreen';
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { Event } from 'realmdb/Event';
import { EventOutcome } from 'types/event';
import { EventRating } from 'components/molecules/EventRating';
import { EventSequenceNavigatorParamList } from 'types/navigation';
import { EventStyle } from 'realmdb/EventStyle';
import { Location } from 'realmdb/Location';
import { LocationsMapResult } from 'components/LocationsMapScreen';
import { ModelFuel } from 'realmdb/ModelFuel';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { Pilot } from 'realmdb/Pilot';
import { SvgXml } from 'react-native-svg';
import { actionScheduleState } from 'lib/checklist';
import { eventSequence } from 'store/slices/eventSequence';
import { makeStyles } from '@rneui/themed';
import { selectEventSequence } from 'store/selectors/eventSequence';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

export type Props = NativeStackScreenProps<
  EventSequenceNavigatorParamList,
  'EventSequenceNewEventEditor'
>;

const EventSequenceNewEventEditorScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const setDebounced = useDebouncedRender();
  const setScreenEditHeader = useScreenEditHeader();
  const confirmAction = useConfirmAction();
  const modelEventStyleStatistics = useModelEventStyleStatistics();
  const event = useEvent();
  const dispatch = useDispatch();
  const realm = useRealm();

  const currentEventSequence = useSelector(selectEventSequence);
  const events = useQuery(Event);
  const model = useObject(Model, new BSON.ObjectId(currentEventSequence.modelId));
  const checklists = useRef(
    model?.checklists.filter(
      c => c.type === ChecklistType.PreEvent || c.type === ChecklistType.PostEvent,
    ),
  );
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const modelFuels = useQuery(ModelFuel);
  const modelPropellers = useQuery(ModelPropeller);
  const eventStyles = useQuery(EventStyle);
  const locations = useQuery(Location);
  const pilots = useQuery(Pilot);

  const _pilot = useSelector(selectPilot);
  const currentPilot = useObject(Pilot, new BSON.ObjectId(_pilot.pilotId));

  const [date] = useState(DateTime.now());
  const duration = useRef(secondsToMSS(currentEventSequence.duration));
  const [fuel, setFuel] = useState<ModelFuel | undefined>(model?.defaultFuel);
  const fuelConsumed = useRef<string>();
  const [propeller, setPropeller] = useState<ModelPropeller | undefined>(model?.defaultPropeller);
  const [eventStyle, setEventStyle] = useState<EventStyle | undefined>(model?.defaultStyle);
  const [location, setLocation] = useState<Location>();
  const [pilot, setPilot] = useState<Pilot | undefined>(currentPilot ? currentPilot : undefined);
  const [outcome, setOutcome] = useState<EventOutcome>();
  const [notes, setNotes] = useState<string | undefined>(undefined);

  const [allBatteryDischarges, setAllBatteryDischarges] = useState<JBatteryDischarge[]>([]);
  const [kind] = useState(eventKind(model?.type));

  useEffect(() => {
    const onCancel = () => {
      confirmAction(cancelEvent, {
        label: `Do Not Log ${kind.name}`,
        title: `This action cannot be undone.\nAre you sure you don't want to log this ${kind.name}?`,
      });
    };

    const onDone = () => {
      if (model) {
        realm.write(() => {
          // For each battery we need to create a new battery cycle and then add the
          // battery cycle to the battery's list of cycles.
          const eventBatteryCycles = [] as BatteryCycle[];
          batteries.forEach((battery, index) => {
            const cycleNumber = battery.totalCycles ? battery.totalCycles + 1 : 1;

            const newCycle = realm.create('BatteryCycle', {
              cycleNumber,
              battery,
              excludeFromPlots: false,
              discharge: allBatteryDischarges[index],
            } as BatteryCycle);

            // Total cycles is tracked on the battery to enable a new battery to be created
            // with some number of unlogged cycles.
            battery.totalCycles = cycleNumber;
            battery.cycles.push(newCycle);

            // Attach the battery cycle to the event.
            eventBatteryCycles.push(newCycle);
          });

          // Update model attributes according to the event.
          // Note - update model before the checklist schedule since the scheduling relies
          // on current model state.
          const eventDuration = MSSToSeconds(duration.current);

          model.lastEvent = date.toISO();
          model.statistics.totalEvents = model.statistics.totalEvents + 1;
          model.statistics.totalTime = model.statistics.totalTime + eventDuration;

          model.statistics = {
            ...model.statistics,
            ...modelCostStatistics(model),
            ...modelEventOutcomeStatistics(model, outcome),
            eventStyleData: modelEventStyleStatistics(
              'add',
              model,
              eventDuration,
              undefined,
              eventStyle,
            ),
          } as ModelStatistics;

          // Update model checklist actions.
          checklists.current?.forEach(checklist => {
            checklist.actions.forEach(action => {
              // Add a checklist action history entry to each action performed during this event.
              const historyEntry =
                currentEventSequence.checklistActionHistoryEntries[
                  checklist.type as EventSequenceChecklistType
                ][action.refId];
              if (historyEntry) {
                action.history.push(historyEntry as ChecklistActionHistoryEntry);
              }

              // Update model checklist action schedule for next event.
              action.schedule.state = actionScheduleState(
                action as JChecklistAction,
                checklist.type,
                model,
              );
            });
          });

          const newEvent = realm.create('Event', {
            createdOn: date.toISO(),
            updatedOn: date.toISO(),
            date: date.toISO(),
            number: events.length + 1,
            outcome,
            duration: eventDuration,
            model,
            pilot,
            location,
            fuel,
            fuelConsumed: Number(fuelConsumed.current),
            propeller,
            eventStyle,
            batteryCycles: eventBatteryCycles,
            notes,
          } as Event);

          // Attach the event to the model.
          model.events.push(newEvent);
        });
      }

      dispatch(eventSequence.reset());
      navigation.getParent()?.goBack();
    };

    setScreenEditHeader(
      { enabled: true, action: onDone, style: { color: theme.colors.screenHeaderInvButtonText } },
      { enabled: true, action: onCancel, style: { color: theme.colors.screenHeaderInvButtonText } },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allBatteryDischarges,
    batteries,
    duration.current,
    outcome,
    pilot,
    location,
    fuel,
    fuelConsumed.current,
    propeller,
    eventStyle,
    notes,
  ]);

  useEffect(() => {
    // Get all the batteries for this event.
    const eventBatteries: Battery[] = [];
    currentEventSequence.batteryIds.forEach(id => {
      const b = realm.objectForPrimaryKey(Battery, new BSON.ObjectId(new BSON.ObjectId(id)));
      b && eventBatteries.push(b);
    });
    setBatteries(eventBatteries);

    // Create initial values for battery cell voltages and resistances.
    const initialBatteryDischarges = [] as JBatteryDischarge[];
    eventBatteries.forEach(battery => {
      initialBatteryDischarges.push({
        date: date.toISO(),
        duration: MSSToSeconds(duration.current),
        packVoltage: 0,
        packResistance: 0,
        cellVoltage: new Array(battery.sCells).fill(0),
        cellResistance: new Array(battery.sCells).fill(0),
      });
    });
    setAllBatteryDischarges(initialBatteryDischarges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('event-model-fuel', onChangeModelFuel);
    event.on('event-model-propeller', onChangeModelPropeller);
    event.on('event-model-style', onChangeEventStyle);
    event.on('event-location', onChangeLocation);
    event.on('event-pilot', onChangePilot);
    event.on('event-outcome', onChangeOutcome);
    event.on('event-notes', onChangeNotes);
    event.on(`event-battery-cell-voltages`, onChangeDischargeCellVoltages);
    event.on(`event-battery-cell-resistances`, onChangeDischargeCellResistances);
    event.on('event-location', onChangeLocation);

    return () => {
      event.removeListener('event-model-fuel', onChangeModelFuel);
      event.removeListener('event-model-propeller', onChangeModelPropeller);
      event.removeListener('event-model-style', onChangeEventStyle);
      event.removeListener('event-pilot', onChangePilot);
      event.removeListener('event-location', onChangeLocation);
      event.removeListener('event-outcome', onChangeOutcome);
      event.removeListener('event-notes', onChangeNotes);
      event.removeListener(`event-battery-cell-voltages`, onChangeDischargeCellVoltages);
      event.removeListener(`event-battery-cell-resistances`, onChangeDischargeCellResistances);
      event.removeListener('event-location', onChangeLocation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelEvent = () => {
    dispatch(eventSequence.reset());
    navigation.getParent()?.goBack();
  };

  const onChangeModelFuel = (result: EnumPickerResult) => {
    const f = modelFuels.find(f => {
      return f.name === result.value[0];
    });
    setFuel(f);
  };

  const onChangeModelPropeller = (result: EnumPickerResult) => {
    const p = modelPropellers.find(p => {
      return p.name === result.value[0];
    });
    setPropeller(p);
  };

  const onChangeEventStyle = (result: EnumPickerResult) => {
    const s = eventStyles.find(s => {
      return s.name === result.value[0];
    });
    setEventStyle(s);
  };

  const onChangeLocation = (result: LocationsMapResult) => {
    const l = locations.find(l => {
      return l._id.toString() === result.locationId;
    });
    setLocation(l);
  };

  const onChangePilot = (result: EnumPickerResult) => {
    const p = pilots.find(p => {
      return p.name === result.value[0];
    });
    setPilot(p);
  };

  const onChangeOutcome = (result: EnumPickerResult) => {
    setOutcome(result.value[0] as EventOutcome);
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    setNotes(result.text);
  };

  const onChangeDischargeCellVoltages = (result: BatteryCellValuesEditorResult) => {
    // extraData is the battery index.
    setDischargeValue('cellVoltage', result.extraData, result.cellValues);
    setDischargeValue('packVoltage', result.extraData, result.packValue);
  };

  const onChangeDischargeCellResistances = (result: BatteryCellValuesEditorResult) => {
    // extraData is the battery index.
    setDischargeValue('cellResistance', result.extraData, result.cellValues);
    setDischargeValue('packResistance', result.extraData, result.packValue);
  };

  const setDischargeValue = (
    property: keyof JBatteryDischargeValues,
    index: number,
    value?: number | number[],
  ) => {
    const batteryDischarges = ([] as JBatteryDischarge[]).concat(allBatteryDischarges);
    batteryDischarges[index][property] = value as number & number[];
    setAllBatteryDischarges(batteryDischarges);
  };

  const renderBatteryPostEvent: ListRenderItem<Battery> = ({ item: battery, index }) => {
    const batteryDischarge = allBatteryDischarges[index];
    const packVoltage = batteryDischarge.packVoltage;
    const cellVoltage = batteryDischarge.cellVoltage;
    const packResistance = batteryDischarge.packResistance;
    const cellResistance = batteryDischarge.cellResistance;
    return (
      <View key={index}>
        <Divider text={`POST-EVENT FOR ${battery.name.toLocaleUpperCase()}`} />
        <ListItemInput
          title={'Pack Voltage'}
          label={'V'}
          value={packVoltage && packVoltage > 0 ? packVoltage.toFixed(1) : undefined}
          position={['first']}
          placeholder={'Value'}
          numeric={true}
          numericProps={{ prefix: '' }}
          onChangeText={value =>
            setDebounced(() =>
              setDischargeValue('packVoltage', index, value ? parseFloat(value) : undefined),
            )
          }
        />
        <ListItemInput
          title={'Pack Resistance'}
          label={'mΩ'}
          value={packResistance && packResistance > 0 ? packResistance.toString() : undefined}
          placeholder={'Value'}
          numeric={true}
          numericProps={{ prefix: '', precision: 3 }}
          onChangeText={value =>
            setDebounced(() =>
              setDischargeValue('packResistance', index, value ? parseFloat(value) : undefined),
            )
          }
        />
        <ListItem
          title={'Cell Voltage'}
          onPress={() =>
            navigation.navigate('BatteryCellValuesEditor', {
              config: {
                name: 'voltage',
                namePlural: 'voltages',
                label: 'V',
                precision: 2,
                headerButtonStyle: { color: theme.colors.screenHeaderInvButtonText },
                extraData: index,
              },
              packValue: packVoltage || 0,
              cellValues: cellVoltage?.map(v => {
                return v || 0;
              }),
              sCells: battery.sCells,
              pCells: battery.pCells,
              eventName: `event-battery-cell-voltages`,
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
                headerButtonStyle: { color: theme.colors.screenHeaderInvButtonText },
                extraData: index,
              },
              packValue: packResistance || 0,
              cellValues: cellResistance?.map(r => {
                return r || 0;
              }),
              sCells: battery.sCells,
              pCells: battery.pCells,
              eventName: `event-battery-cell-resistances`,
            })
          }
        />
      </View>
    );
  };

  if (!model) {
    return <EmptyView error message={'Model Not Found!'} />;
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItem
        title={model?.name}
        subtitle={modelSummary(model)}
        titleStyle={s.modelText}
        subtitleStyle={s.modelText}
        subtitleNumberOfLines={2}
        position={['first', 'last']}
        leftImage={
          <View style={s.modelIconContainer}>
            {model.image ? (
              <Image source={{ uri: model.image }} resizeMode={'cover'} style={s.modelImage} />
            ) : (
              <View style={s.modelSvgContainer}>
                <SvgXml
                  xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
                  width={s.modelImage.width}
                  height={s.modelImage.height}
                  color={theme.colors.brandSecondary}
                  style={s.modelIcon}
                />
              </View>
            )}
          </View>
        }
        rightImage={false}
        zeroEdgeContent={true}
      />
      <Divider />
      <ListItem
        title={'Date'}
        value={date.toFormat("MMM dd, yyyy 'at' h:mma")}
        position={['first']}
        rightImage={false}
      />
      <ListItemInput
        title={'Duration'}
        label={'m:ss'}
        value={duration.current}
        placeholder={'Value'}
        numeric={true}
        numericProps={{ prefix: '', separator: ':' }}
        keyboardType={'number-pad'}
        onChangeText={value => value && setDebounced(() => (duration.current = value))}
      />
      <ListItem
        title={'Location'}
        value={location?.name || 'Unknown'}
        onPress={() =>
          navigation.navigate('LocationNavigator', {
            screen: 'LocationsMap',
            params: {
              eventName: 'event-location',
              locationId: location?._id.toString(),
            },
          })
        }
      />
      <ListItem
        title={'Outcome'}
        position={['last']}
        value={<EventRating value={outcome} />}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: `${kind.name} Outcome`,
            headerBackTitle: `${kind.name}`,
            values: Object.values(EventOutcome),
            icons: eventOutcomeIcons,
            selected: outcome,
            eventName: 'event-outcome',
          })
        }
      />
      <Divider />
      {modelHasPropeller(model.type) && (
        <ListItem
          title={'Default Propeller'}
          value={propeller?.name || 'None'}
          position={['first', 'last']}
          onPress={() =>
            navigation.navigate('EnumPicker', {
              title: 'Default Propeller',
              headerBackTitle: 'Model',
              footer: 'You can manage propellers through the Globals section in the Setup tab.',
              values: modelPropellers.map(p => {
                return p.name;
              }),
              selected: propeller?.name,
              mode: 'one-or-none',
              eventName: 'event-model-propeller',
            })
          }
        />
      )}
      <Divider />
      <ListItem
        title={'Fuel'}
        position={['first']}
        value={fuel?.name || 'Unspecified'}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'Fuel',
            headerBackTitle: `${kind.name}`,
            footer: 'You can manage fuels through the Globals section in the Setup tab.',
            values: modelFuels.map(f => {
              return f.name;
            }),
            selected: fuel?.name,
            mode: 'one-or-none',
            eventName: 'event-model-fuel',
          })
        }
      />
      <ListItemInput
        title={'Fuel Consumed'}
        value={fuelConsumed.current}
        label="oz"
        placeholder={'Value'}
        numeric={true}
        numericProps={{ precision: 2, prefix: '' }}
        keyboardType={'number-pad'}
        onChangeText={value => setDebounced(() => (fuelConsumed.current = value))}
      />
      <Divider />
      <ListItem
        title={'Pilot'}
        position={['first']}
        value={pilot?.name || 'Unknown'}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'Pilot',
            headerBackTitle: `${kind.name}`,
            footer: 'You can manage pilots through the Globals section in the Setup tab.',
            values: pilots.map(p => {
              return p.name;
            }),
            selected: pilot?.name,
            eventName: 'event-pilot',
          })
        }
      />
      <ListItem
        title={'Style'}
        position={['last']}
        value={eventStyle?.name || 'Unspecified'}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'Style',
            headerBackTitle: `${kind.name}`,
            footer: 'You can manage styles through the Globals section in the Setup tab.',
            values: eventStyles.map(s => {
              return s.name;
            }),
            selected: eventStyle?.name,
            mode: 'one-or-none',
            eventName: 'event-model-style',
          })
        }
      />
      <Divider text={'NOTES'} />
      <ListItem
        title={notes || 'Notes'}
        position={['first', 'last']}
        onPress={() =>
          navigation.navigate('NotesEditor', {
            title: 'Event Notes',
            headerButtonStyle: { color: theme.colors.screenHeaderInvButtonText },
            text: notes,
            eventName: 'event-notes',
          })
        }
      />
      {model.logsBatteries && (
        <FlatList
          scrollEnabled={false}
          data={batteries}
          renderItem={renderBatteryPostEvent}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<Divider />}
        />
      )}
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  modelIconContainer: {
    position: 'absolute',
    left: -15,
  },
  modelImage: {
    width: 150,
    height: 85,
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
  modelText: {
    left: 140,
    maxWidth: '48%',
  },
}));

export default EventSequenceNewEventEditorScreen;
