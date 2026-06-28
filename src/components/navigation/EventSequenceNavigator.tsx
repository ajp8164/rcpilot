import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRealm } from '@realm/react';
import { navigatorScreenOptions } from 'components/atoms/navigation/navigatorScreenOptions';
import BatteryCellValuesEditorScreen from 'components/BatteryCellValuesEditorScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import EventSequenceBatteryPickerScreen from 'components/EventSequenceBatteryPickerScreen';
import EventSequenceChecklistItemScreen from 'components/EventSequenceChecklistItemScreen';
import EventSequenceChecklistScreen from 'components/EventSequenceChecklistScreen';
import EventSequenceNewEventEditorScreen from 'components/EventSequenceNewEventEditorScreen';
import EventSequenceTimerScreen from 'components/EventSequenceTimerScreen';
import NotesEditorScreen from 'components/NotesEditorScreen';
import { eventKind } from 'lib/modelEvent';
import lodash from 'lodash';
import { BSON } from 'realm';
import { Model } from 'realmdb/Model';
import { store } from 'store';
import { ChecklistType } from 'types/checklist';
import { EventSequenceNavigatorParamList } from 'types/navigation';

import NavContext from './NavContext';

const EventSequenceStack =
  createNativeStackNavigator<EventSequenceNavigatorParamList>();

const EventSequenceNavigator = () => {
  const theme = useTheme();
  const realm = useRealm();

  return (
    <NavContext.Provider value={{ isModal: true }}>
      <EventSequenceStack.Navigator
        initialRouteName="EventSequenceBatteryPicker"
        screenOptions={navigatorScreenOptions(theme)}>
        <EventSequenceStack.Screen
          name="EventSequenceBatteryPicker"
          component={EventSequenceBatteryPickerScreen}
          options={{
            title: 'Batteries',
          }}
        />
        <EventSequenceStack.Screen
          name="EventSequenceChecklist"
          component={EventSequenceChecklistScreen}
          options={({ route }) => {
            const modelId = store.getState().eventSequence.modelId;
            const model = realm.objectForPrimaryKey(
              'Model',
              new BSON.ObjectId(modelId),
            ) as Model;
            const kind = eventKind(model ? model.type : undefined);
            const type =
              route.params.checklistType === ChecklistType.PreEvent
                ? 'Pre-'
                : 'Post-';
            return {
              title: `${type}${kind.name}`,
            };
          }}
        />
        <EventSequenceStack.Screen
          name="EventSequenceChecklistItem"
          component={EventSequenceChecklistItemScreen}
          options={{
            title: 'Checklist Item',
          }}
        />
        <EventSequenceStack.Screen
          name="EventSequenceNewEventEditor"
          component={EventSequenceNewEventEditorScreen}
          options={() => {
            const modelId = store.getState().eventSequence.modelId;
            const model = realm.objectForPrimaryKey(
              'Model',
              new BSON.ObjectId(modelId),
            ) as Model;
            const kind = eventKind(model ? model.type : undefined);
            return {
              title: `Log ${kind.name}`,
            };
          }}
        />
        <EventSequenceStack.Screen
          name="EnumPicker"
          component={EnumPickerScreen}
          options={{
            title: '',
          }}
        />
        <EventSequenceStack.Screen
          name="NotesEditor"
          component={NotesEditorScreen}
          options={() => {
            const modelId = store.getState().eventSequence.modelId;
            const model = realm.objectForPrimaryKey(
              'Model',
              new BSON.ObjectId(modelId),
            ) as Model;
            const kind = eventKind(model ? model.type : undefined);
            return {
              title: `${kind.name} Notes`,
            };
          }}
        />
        <EventSequenceStack.Screen
          name="EventSequenceTimer"
          component={EventSequenceTimerScreen}
          options={() => {
            const modelId = store.getState().eventSequence.modelId;
            const model = realm.objectForPrimaryKey(
              'Model',
              new BSON.ObjectId(modelId),
            ) as Model;
            const kind = eventKind(model ? model.type : undefined);
            return {
              title: `${kind.name} Timer`,
              headerLargeStyle: {
                backgroundColor: theme.colors.brandPrimary,
              },
              headerTitleStyle: { color: theme.colors.stickyWhite },
              headerTintColor: theme.colors.stickyWhite,
              headerShadowVisible: false,
            };
          }}
        />
        <EventSequenceStack.Screen
          name="BatteryCellValuesEditor"
          component={BatteryCellValuesEditorScreen}
          options={({ route }) => ({
            title: `Cell ${lodash.startCase(route.params.config.namePlural)}`,
          })}
        />
      </EventSequenceStack.Navigator>
    </NavContext.Provider>
  );
};

export default EventSequenceNavigator;
