import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  ListRenderItem,
  ScrollView,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItem,
  ListItemDateTime,
  ThemeManager,
  getColoredSvg,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useQuery, useRealm } from '@realm/react';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { LocationsMapResult } from 'components/LocationsMapScreen';
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
import { EmptyView } from 'components/molecules/EmptyView';
import { EventRating } from 'components/molecules/EventRating';
import { Formik, FormikProps } from 'formik';
import {
  modelEventOutcomeStatistics,
  useModelEventStyleStatistics,
} from 'lib/analytics';
import { batteryCycleDescription, batteryCycleTitle } from 'lib/batteryCycle';
import { MSSToSeconds, secondsToFormat } from 'lib/formatters';
import { Masks } from 'lib/inputMasks';
import { modelHasPropeller, modelSummary, modelTypeIconProps } from 'lib/model';
import { eventKind, eventOutcomeIcons } from 'lib/modelEvent';
import lodash from 'lodash';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { Event } from 'realmdb/Event';
import { EventStyle } from 'realmdb/EventStyle';
import { Location } from 'realmdb/Location';
import { ModelFuel } from 'realmdb/ModelFuel';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { Pilot } from 'realmdb/Pilot';
import { toNumber } from 'realmdb/helpers';
import { EventOutcome } from 'types/event';
import {
  LogNavigatorParamList,
  ModelsNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';
import * as Yup from 'yup';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<ModelsNavigatorParamList, 'EventEditor'>,
  AdditionalNavigationProps
>;

export type AdditionalNavigationProps = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList>,
  NativeStackScreenProps<LogNavigatorParamList>
>;

// Order of fields for accessory view.
enum Fields {
  duration,
  fuelConsumed,
}

type FormValues = {
  duration: string;
  fuelConsumed: string;
};

const EventEditorScreen = ({ navigation, route }: Props) => {
  const { eventId } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const event = useEvent();
  const modelEventStyleStatistics = useModelEventStyleStatistics();
  const realm = useRealm();

  const modelEvent = useObject(Event, new BSON.ObjectId(eventId));

  const modelFuels = useQuery(ModelFuel);
  const modelPropellers = useQuery(ModelPropeller);
  const eventStyles = useQuery(EventStyle);
  const locations = useQuery(Location);
  const pilots = useQuery(Pilot);

  const [expandedDate, setExpandedDate] = useState(false);
  const [kind] = useState(eventKind(modelEvent?.model?.type));

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const durationFieldRef = useRef<ListItemInputMethods>(null);
  const fuelConsumedFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  const initialValues = {
    duration: secondsToFormat(modelEvent?.duration.toString(), {
      format: 'm:ss',
    }),
    fuelConsumed: modelEvent?.fuelConsumed?.toFixed(2),
    outcome: modelEvent?.outcome,
  } as FormValues;

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [durationFieldRef.current, fuelConsumedFieldRef.current].filter(Boolean),
    );
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

  const schema = Yup.object().shape({
    duration: Yup.string().required(),
    fuelConsumed: Yup.string(),
  });

  const cancel = () => {
    Keyboard.dismiss();
    formikRef.current?.resetForm();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
  };

  const onSubmit = (values: FormValues) => {
    if (!eventId || !modelEvent) return;

    const previous = {
      duration: modelEvent.duration,
      eventStyle: modelEvent.eventStyle,
      outcome: modelEvent.outcome,
    };

    realm.write(() => {
      modelEvent.duration = MSSToSeconds(values.duration || 0);
      modelEvent.fuelConsumed = toNumber(values.fuelConsumed);
      updateStatistics({ previous });
    });

    // Update the displayed value format.
    // Update the form without affecting state.
    formikRef.current?.resetForm({
      values: {
        ...formikRef.current?.values,
        duration: secondsToFormat(modelEvent.duration, { format: 'm:ss' }),
      },
    });
  };

  const updateStatistics = (props?: {
    previous?: {
      duration?: number;
      eventStyle?: EventStyle;
      outcome?: EventOutcome;
    };
  }) => {
    if (!modelEvent) return;
    const { previous } = props ?? {};

    // Battery statistics.
    if (previous?.duration !== modelEvent.duration) {
      // Model events do not affect battery charge phase.
      modelEvent.batteryCycles.forEach(c => {
        if (c.discharge) {
          c.discharge.duration = modelEvent.duration;
        }
      });
    }

    // Model statistics.
    if (
      previous &&
      (previous.duration !== modelEvent.duration ||
        previous?.eventStyle !== modelEvent.eventStyle)
    ) {
      modelEvent.model.statistics.eventStyleData = modelEventStyleStatistics(
        'update',
        modelEvent.model,
        modelEvent.duration,
        previous?.eventStyle,
        modelEvent.eventStyle,
      );

      modelEvent.model.statistics.totalTime =
        modelEvent.model.statistics.totalTime -
        (previous?.duration || 0) +
        modelEvent.duration;
    }

    // Outcome statistics.
    if (previous?.outcome !== modelEvent.outcome) {
      modelEvent.model.statistics = lodash.merge(
        modelEvent.model.statistics,
        modelEventOutcomeStatistics(modelEvent.model, modelEvent.outcome),
      );
    }
  };

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);

    navigation.setOptions({
      headerLeft: () => {
        if (next?.dirty) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={cancel}
            />
          );
        }
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

  const onDateChange = (date?: Date) => {
    if (!modelEvent) return;
    realm.write(() => {
      modelEvent.updatedOn = DateTime.now().toISO();
      modelEvent.date =
        (date && DateTime.fromJSDate(date).toISO()) || new Date().toISOString();
      updateStatistics();
    });
  };

  const onChangeModelFuel = (result: EnumPickerResult) => {
    if (!modelEvent) return;
    const f = modelFuels.find(f => {
      return f.name === result.value[0];
    });
    realm.write(() => {
      modelEvent.updatedOn = DateTime.now().toISO();
      modelEvent.fuel = f;
      updateStatistics();
    });
  };

  const onChangeModelPropeller = (result: EnumPickerResult) => {
    if (!modelEvent) return;
    const p = modelPropellers.find(p => {
      return p.name === result.value[0];
    });
    realm.write(() => {
      modelEvent.updatedOn = DateTime.now().toISO();
      modelEvent.propeller = p;
      updateStatistics();
    });
  };

  const onChangeEventStyle = (result: EnumPickerResult) => {
    if (!modelEvent) return;
    const previous = {
      eventStyle: modelEvent?.eventStyle,
    };

    const s = eventStyles.find(s => {
      return s.name === result.value[0];
    });
    realm.write(() => {
      modelEvent.updatedOn = DateTime.now().toISO();
      modelEvent.eventStyle = s;
      updateStatistics({ previous });
    });
  };

  const onChangeLocation = (result: LocationsMapResult) => {
    if (!modelEvent) return;
    const l = locations.find(l => {
      return l._id.toString() === result.locationId;
    });
    realm.write(() => {
      modelEvent.updatedOn = DateTime.now().toISO();
      modelEvent.location = l;
      updateStatistics();
    });
  };

  const onChangePilot = (result: EnumPickerResult) => {
    if (!modelEvent) return;
    const p = pilots.find(p => {
      return p.name === result.value[0];
    });
    if (p) {
      realm.write(() => {
        modelEvent.updatedOn = DateTime.now().toISO();
        modelEvent.pilot = p;
        updateStatistics();
      });
    }
  };

  const onChangeOutcome = (result: EnumPickerResult) => {
    if (!modelEvent) return;
    const previous = {
      outcome: modelEvent?.outcome,
    };
    realm.write(() => {
      modelEvent.updatedOn = DateTime.now().toISO();
      modelEvent.outcome = result.value[0] as EventOutcome;
      updateStatistics({ previous });
    });
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    if (!modelEvent) return;
    realm.write(() => {
      modelEvent.updatedOn = DateTime.now().toISO();
      modelEvent.notes = result.text;
      updateStatistics();
    });
  };

  const renderBatteryCycle: ListRenderItem<BatteryCycle> = ({
    item: cycle,
    index,
  }) => {
    return (
      <ListItem
        key={index}
        title={batteryCycleTitle(cycle)}
        subtitle={batteryCycleDescription(cycle)}
        position={listItemPosition(
          index,
          modelEvent?.batteryCycles.length || 0,
        )}
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
    <>
      <ScrollView
        style={theme.styles.view}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider />
        <ListItem
          title={modelEvent.model?.name}
          subtitle={modelEvent.model && modelSummary(modelEvent.model)}
          subtitleLines={0}
          position={['first', 'last']}
          leftContentStyle={{ paddingLeft: 0 }}
          leftContent={
            <View>
              {modelEvent.model?.image ? (
                <Image
                  source={{ uri: modelEvent.model.image }}
                  resizeMode={'cover'}
                  style={s.modelImage}
                />
              ) : modelEvent?.model?.type ? (
                <View style={s.modelSvgContainer}>
                  {modelEvent.model?.type && (
                    <SvgXml
                      xml={getColoredSvg(
                        modelTypeIconProps[modelEvent.model.type]?.name,
                      )}
                      width={s.modelImage.width}
                      height={s.modelImage.height}
                      color={theme.colors.brandSecondary}
                      style={s.modelIcon}
                    />
                  )}
                </View>
              ) : null}
            </View>
          }
        />
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
          {({ handleChange, values }) => (
            <View>
              <FormikStateWatcher<FormValues>
                onChange={onFormikWatcherStateChange}
              />
              <Divider />
              <ListItemDateTime
                title={'Date'}
                value={DateTime.fromISO(modelEvent.date).toFormat(
                  "MMM d, yyyy 'at' h:mm a",
                )}
                mode={'datetime'}
                pickerValue={modelEvent.date}
                expanded={expandedDate}
                position={['first']}
                accentColor={theme.colors.brandSecondary}
                onPress={() => setExpandedDate(!expandedDate)}
                onChange={onDateChange}
              />
              <ListItemInput
                ref={durationFieldRef}
                title={'Duration'}
                titleStyle={!MSSToSeconds(values.duration) ? s.required : {}}
                units={'m:ss'}
                container={'right'}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: (_, unformatted) =>
                    handleChange('duration')(unformatted),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.duration),
                  value: values.duration,
                  placeholder: '0:00',
                  mask: Masks.MINUTES_SECONDS,
                  rtlNumber: true,
                  keyboardType: 'number-pad',
                }}
              />
              <ListItem
                title={'Location'}
                value={modelEvent.location?.name || 'Unknown'}
                rightContent={'chevron-right'}
                onPress={() =>
                  navigation.navigate('LocationNavigator', {
                    screen: 'LocationsMap',
                    params: {
                      eventName: 'event-location',
                      locationId: modelEvent.location?._id.toString(),
                    },
                  })
                }
              />
              <ListItem
                title={'Outcome'}
                position={['last']}
                rightContent={'chevron-right'}
                value={<EventRating value={modelEvent.outcome} />}
                onPress={() =>
                  navigation.navigate('EnumPicker', {
                    title: `${kind.name} Outcome`,
                    headerBackTitle: `${kind.name}`,
                    values: Object.values(EventOutcome),
                    icons: eventOutcomeIcons,
                    selected: modelEvent.outcome,
                    eventName: 'event-outcome',
                  })
                }
              />
              <Divider />
              {modelEvent.model?.type &&
                modelHasPropeller(modelEvent.model.type) && (
                  <ListItem
                    title={'Propeller'}
                    value={modelEvent.propeller?.name || 'None'}
                    position={['first', 'last']}
                    rightContent={'chevron-right'}
                    onPress={() =>
                      navigation.navigate('EnumPicker', {
                        enumName: 'ModelPropeller',
                        title: 'Propeller',
                        headerBackTitle: 'Model',
                        footer:
                          'You can manage propellers through the Globals section in the Setup tab.',
                        values: modelPropellers.map(p => {
                          return p.name;
                        }),
                        selected: modelEvent.propeller?.name,
                        mode: 'one-or-none',
                        eventName: 'event-model-propeller',
                      })
                    }
                  />
                )}
              {modelEvent.model?.logsFuel && (
                <>
                  <Divider />
                  <ListItem
                    title={'Fuel'}
                    position={['first']}
                    rightContent={'chevron-right'}
                    value={modelEvent.fuel?.name || 'Unspecified'}
                    onPress={() =>
                      navigation.navigate('EnumPicker', {
                        enumName: 'ModelFuel',
                        title: 'Fuel',
                        headerBackTitle: `${kind.name}`,
                        footer:
                          'You can manage fuels through the Globals section in the Setup tab.',
                        values: modelFuels.map(f => {
                          return f.name;
                        }),
                        selected: modelEvent.fuel?.name,
                        mode: 'one-or-none',
                        eventName: 'event-model-fuel',
                      })
                    }
                  />
                  <ListItemInput
                    ref={fuelConsumedFieldRef}
                    position={['last']}
                    title={'Fuel Consumed'}
                    units={'oz'}
                    container={'right'}
                    inputProps={{
                      inputAccessoryViewID: 'keyboardAccessory',
                      inputStyle: {
                        backgroundColor: theme.colors.transparent,
                        textAlign: 'right',
                      },
                      onChangeText: (_, unformatted) =>
                        handleChange('fuelConsumed')(unformatted),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(
                          Fields.fuelConsumed,
                        ),
                      value: values.fuelConsumed,
                      placeholder: '0.00',
                      mask: Masks.OUNCES,
                      rtlNumber: true,
                      keyboardType: 'number-pad',
                    }}
                  />
                </>
              )}
              <Divider />
              <ListItem
                title={'Pilot'}
                position={['first']}
                rightContent={'chevron-right'}
                value={modelEvent.pilot?.name || 'Unknown'}
                onPress={() =>
                  navigation.navigate('EnumPicker', {
                    enumName: 'Pilot',
                    title: 'Pilot',
                    headerBackTitle: `${kind.name}`,
                    footer:
                      'You can manage pilots through the Globals section in the Setup tab.',
                    values: pilots.map(p => {
                      return p.name;
                    }),
                    selected: modelEvent.pilot?.name,
                    eventName: 'event-pilot',
                  })
                }
              />
              <ListItem
                title={'Style'}
                position={['last']}
                rightContent={'chevron-right'}
                value={modelEvent.eventStyle?.name || 'Unspecified'}
                onPress={() =>
                  navigation.navigate('EnumPicker', {
                    enumName: 'EventStyle',
                    title: 'Style',
                    headerBackTitle: `${kind.name}`,
                    footer:
                      'You can manage styles through the Globals section in the Setup tab.',
                    values: eventStyles.map(s => {
                      return s.name;
                    }),
                    selected: modelEvent.eventStyle?.name,
                    mode: 'one-or-none',
                    eventName: 'event-model-style',
                  })
                }
              />
            </View>
          )}
        </Formik>
        <Divider text={'NOTES'} />
        <ListItemNotes
          notes={modelEvent.notes}
          position={['first', 'last']}
          onPress={() =>
            navigation.navigate('NotesEditor', {
              title: 'Event Notes',
              text: modelEvent.notes,
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
                text={
                  modelEvent.batteryCycles.length === 1
                    ? 'BATTERY USED'
                    : 'BATTERIES USED'
                }
              />
            }
          />
        )}
        <Divider />
      </ScrollView>
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
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  modelImage: {
    width: 100,
    height: 80,
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
  required: {
    color: theme.colors.assertive,
  },
}));

export default EventEditorScreen;
