import { AppTheme, useTheme } from 'theme';
import { Divider, getColoredSvg } from '@react-native-ajp-elements/ui';
import { FlatList, Image, ListRenderItem, ScrollView, View } from 'react-native';
import { ListItem, ListItemDate, ListItemInput, listItemPosition } from 'components/atoms/List';
import {
  LogNavigatorParamList,
  ModelsNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';
import { MSSToSeconds, secondsToMSS } from 'lib/formatters';
import React, { useEffect, useState } from 'react';
import { batteryCycleDescription, batteryCycleTitle } from 'lib/batteryCycle';
import { eqNumber, eqObjectId, eqString, toNumber } from 'realmdb/helpers';
import { eventKind, eventOutcomeIcons } from 'lib/modelEvent';
import { modelEventOutcomeStatistics, useModelEventStyleStatistics } from 'lib/analytics';
import { modelHasPropeller, modelSummary, modelTypeIcons } from 'lib/model';
import { useObject, useQuery, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { CompositeScreenProps } from '@react-navigation/core';
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { Event } from 'realmdb/Event';
import { EventOutcome } from 'types/event';
import { EventRating } from 'components/molecules/EventRating';
import { EventStyle } from 'realmdb/EventStyle';
import { Location } from 'realmdb/Location';
import { LocationsMapResult } from 'components/LocationsMapScreen';
import { ModelFuel } from 'realmdb/ModelFuel';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { Pilot } from 'realmdb/Pilot';
import { SvgXml } from 'react-native-svg';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<ModelsNavigatorParamList, 'EventEditor'>,
  AdditionalNavigationProps
>;

export type AdditionalNavigationProps = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList>,
  NativeStackScreenProps<LogNavigatorParamList>
>;

const EventEditorScreen = ({ navigation, route }: Props) => {
  const { eventId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const modelEventStyleStatistics = useModelEventStyleStatistics();
  const realm = useRealm();

  const modelEvent = useObject(Event, new BSON.ObjectId(eventId));

  const modelFuels = useQuery(ModelFuel);
  const modelPropellers = useQuery(ModelPropeller);
  const eventStyles = useQuery(EventStyle);
  const locations = useQuery(Location);
  const pilots = useQuery(Pilot);

  const [date, setDate] = useState(modelEvent?.createdOn);
  const [duration, setDuration] = useState(secondsToMSS(modelEvent?.duration) || undefined);
  const [fuel, setFuel] = useState(modelEvent?.fuel || undefined);
  const [fuelConsumed, setFuelConsumed] = useState(
    modelEvent?.fuelConsumed?.toString() || undefined,
  );
  const [propeller, setPropeller] = useState(modelEvent?.propeller || undefined);
  const [eventStyle, setEventStyle] = useState(modelEvent?.eventStyle || undefined);
  const [location, setLocation] = useState(modelEvent?.location || undefined);
  const [pilot, setPilot] = useState(modelEvent?.pilot || undefined);
  const [outcome, setOutcome] = useState(modelEvent?.outcome || undefined);
  const [notes, setNotes] = useState(modelEvent?.notes || undefined);

  const [expandedDate, setExpandedDate] = useState(false);
  const [kind] = useState(eventKind(modelEvent?.model?.type));

  useEffect(() => {
    if (!eventId || !modelEvent) return;

    const canSave =
      !!duration &&
      (!eqString(modelEvent.date, date) ||
        !eqNumber(modelEvent.duration, MSSToSeconds(duration).toString()) ||
        !eqObjectId(modelEvent.location, location) ||
        !eqString(modelEvent.outcome, outcome) ||
        !eqObjectId(modelEvent.propeller, propeller) ||
        !eqObjectId(modelEvent.fuel, fuel) ||
        !eqNumber(modelEvent.fuelConsumed, fuelConsumed) ||
        !eqObjectId(modelEvent.pilot, pilot) ||
        !eqObjectId(modelEvent.eventStyle, eventStyle) ||
        !eqString(modelEvent.notes, notes));

    if (canSave) {
      const previous = {
        eventStyle: modelEvent.eventStyle,
        duration: modelEvent.duration,
        outcome: modelEvent.outcome,
      };

      realm.write(() => {
        modelEvent.updatedOn = DateTime.now().toISO();
        modelEvent.date = date || DateTime.now().toISO();
        modelEvent.duration = MSSToSeconds(duration);
        modelEvent.outcome = outcome;
        modelEvent.propeller = propeller;
        modelEvent.fuel = fuel;
        modelEvent.fuelConsumed = toNumber(fuelConsumed);
        pilot ? (modelEvent.pilot = pilot) : null;
        modelEvent.eventStyle = eventStyle;
        modelEvent.notes = notes;

        // Update battery cycle duration if event duration is changed.
        // Model events do not affect battery charge phase.
        if (previous.duration !== modelEvent.duration) {
          modelEvent.batteryCycles.forEach(c => {
            if (c.discharge) {
              c.discharge.duration = modelEvent.duration;
            }
          });
        }

        // Update model statistics with changes made here.
        // Recompute event duration data only when inputs change.
        if (
          previous.duration !== modelEvent.duration ||
          previous.eventStyle?._id.toString() !== modelEvent.eventStyle?._id.toString()
        ) {
          modelEvent.model.statistics.eventStyleData = modelEventStyleStatistics(
            'update',
            modelEvent.model,
            modelEvent.duration,
            previous.eventStyle,
            eventStyle,
          );
        }

        if (previous.outcome !== modelEvent.outcome) {
          modelEvent.model.statistics = lodash.merge(
            modelEvent.model.statistics,
            modelEventOutcomeStatistics(modelEvent.model, outcome),
          );
        }

        if (previous.duration !== modelEvent.duration) {
          modelEvent.model.statistics.totalTime =
            modelEvent.model.statistics.totalTime + modelEvent.duration;
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, duration, outcome, propeller, fuel, fuelConsumed, pilot, eventStyle, notes]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('event-model-fuel', onChangeModelFuel);
    event.on('event-model-propeller', onChangeModelPropeller);
    event.on('event-model-style', onChangeEventStyle);
    event.on('event-location', onChangeLocation);
    event.on('event-pilot', onChangePilot);
    event.on('event-outcome', onChangeOutcome);
    event.on('event-notes', onChangeNotes);

    return () => {
      event.removeListener('event-model-fuel', onChangeModelFuel);
      event.removeListener('event-model-propeller', onChangeModelPropeller);
      event.removeListener('event-model-style', onChangeEventStyle);
      event.removeListener('event-pilot', onChangePilot);
      event.removeListener('event-location', onChangeLocation);
      event.removeListener('event-outcome', onChangeOutcome);
      event.removeListener('event-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDateChange = (date?: Date) => {
    date && setDate(DateTime.fromJSDate(date).toISO() || new Date().toISOString());
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

  const renderBatteryCycle: ListRenderItem<BatteryCycle> = ({ item: cycle, index }) => {
    return (
      <ListItem
        key={index}
        title={batteryCycleTitle(cycle)}
        subtitle={batteryCycleDescription(cycle)}
        position={listItemPosition(index, modelEvent?.batteryCycles.length || 0)}
        onPress={() =>
          navigation.navigate('BatteryCycleEditor', {
            batteryId: cycle.battery._id.toString(),
            cycleNumber: cycle.cycleNumber,
          })
        }
      />
    );
  };

  if (!modelEvent) {
    return <EmptyView error message={'Event Not Found!'} />;
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItem
        title={modelEvent.model?.name}
        subtitle={modelEvent.model && modelSummary(modelEvent.model)}
        titleStyle={s.modelText}
        subtitleStyle={s.modelText}
        subtitleNumberOfLines={2}
        position={['first', 'last']}
        leftImage={
          <View style={s.modelIconContainer}>
            {modelEvent.model?.image ? (
              <Image
                source={{ uri: modelEvent.model.image }}
                resizeMode={'cover'}
                style={s.modelImage}
              />
            ) : (
              <View style={s.modelSvgContainer}>
                {modelEvent.model?.type && (
                  <SvgXml
                    xml={getColoredSvg(modelTypeIcons[modelEvent.model.type]?.name as string)}
                    width={s.modelImage.width}
                    height={s.modelImage.height}
                    color={theme.colors.brandSecondary}
                    style={s.modelIcon}
                  />
                )}
              </View>
            )}
          </View>
        }
        rightImage={false}
        zeroEdgeContent={true}
      />
      <Divider />
      <ListItemDate
        title={'Date'}
        value={date && DateTime.fromISO(date).toFormat("MMM d, yyyy 'at' h:mm a")}
        pickerValue={date}
        rightImage={false}
        expanded={expandedDate}
        position={['first']}
        onPress={() => setExpandedDate(!expandedDate)}
        onDateChange={onDateChange}
      />
      <ListItemInput
        title={'Duration'}
        label={'m:ss'}
        value={duration}
        titleStyle={!duration ? s.required : {}}
        placeholder={'Value'}
        numeric={true}
        numericProps={{ prefix: '', separator: ':' }}
        keyboardType={'number-pad'}
        onChangeText={setDuration}
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
      {modelEvent.model?.type && modelHasPropeller(modelEvent.model.type) && (
        <ListItem
          title={'Propeller'}
          value={propeller?.name || 'None'}
          position={['first', 'last']}
          onPress={() =>
            navigation.navigate('EnumPicker', {
              title: 'Propeller',
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
        value={fuelConsumed}
        label="oz"
        placeholder={'Value'}
        numeric={true}
        numericProps={{ precision: 2, prefix: '' }}
        position={['last']}
        keyboardType={'number-pad'}
        onChangeText={setFuelConsumed}
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
      {modelEvent.model?.logsBatteries && (
        <FlatList
          scrollEnabled={false}
          data={modelEvent.batteryCycles}
          renderItem={renderBatteryCycle}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Divider
              text={modelEvent.batteryCycles.length === 1 ? 'BATTERY USED' : 'BATTERIES USED'}
            />
          }
        />
      )}
      <Divider />
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
  required: {
    color: theme.colors.assertive,
  },
}));

export default EventEditorScreen;
