import { BSON } from 'realm';
import BatteryCellValuesEditorScreen from 'components/BatteryCellValuesEditorScreen';
import EnumPickerScreen from 'components/EnumPickerScreen';
import EventSequenceBatteryPickerScreen from 'components/EventSequenceBatteryPickerScreen';
import EventSequenceChecklistItemScreen from 'components/EventSequenceChecklistItemScreen';
import { EventSequenceNavigatorParamList } from 'types/navigation';
import EventSequenceNewEventEditorScreen from 'components/EventSequenceNewEventEditorScreen';
import EventSequencePreCheckScreen from 'components/EventSequencePreCheckScreen';
import EventSequenceTimerScreen from 'components/EventSequenceTimerScreen';
import { Model } from 'realmdb/Model';
import NavContext from './NavContext';
import NotesScreen from 'components/NotesScreen';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { eventKind } from 'lib/event';
import lodash from 'lodash';
import { store } from 'store';
import { useRealm } from '@realm/react';
import { useTheme } from 'theme';

const EventSequenceStack = createNativeStackNavigator<EventSequenceNavigatorParamList>();

const EventSequenceNavigator = () => {
  const theme = useTheme();
  const realm = useRealm();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <EventSequenceStack.Navigator
      initialRouteName='EventSequenceBatteryPicker'
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.screenHeaderInvBackground },
        headerTitleStyle: { color: theme.colors.stickyWhite },
        headerTintColor: theme.colors.stickyWhite,
      }}>
        <EventSequenceStack.Screen
          name='EventSequenceBatteryPicker'
          component={EventSequenceBatteryPickerScreen}
          options={{
            title: 'Batteries',
          }}
          />
        <EventSequenceStack.Screen
          name='EventSequencePreCheck'
          component={EventSequencePreCheckScreen}
          options={() => {
            const modelId = store.getState().eventSequence.modelId;
            const model = realm.objectForPrimaryKey('Model', new BSON.ObjectId(modelId)) as Model;
            const kind = eventKind(model ? model.type : undefined);
            return {
              title: `Pre-${kind.name}`,
            }
          }}
        />
        <EventSequenceStack.Screen
          name='EventSequenceChecklistItem'
          component={EventSequenceChecklistItemScreen}
          options={{
            title: 'Checklist Item',
          }}
        />
        <EventSequenceStack.Screen
          name='EventSequenceNewEventEditor'
          component={EventSequenceNewEventEditorScreen}
          options={() => {
            const modelId = store.getState().eventSequence.modelId;
            const model = realm.objectForPrimaryKey('Model', new BSON.ObjectId(modelId)) as Model;
            const kind = eventKind(model ? model.type : undefined);
            return {
              title: `Log ${kind.name}`,
            }
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
          name='Notes'
          component={NotesScreen}
          options={() => {
            const modelId = store.getState().eventSequence.modelId;
            const model = realm.objectForPrimaryKey('Model', new BSON.ObjectId(modelId)) as Model;
            const kind = eventKind(model ? model.type : undefined);
            return {
              title: `${kind.name} Notes`,
            }
          }}
        />
        <EventSequenceStack.Screen
          name='EventSequenceTimer'
          component={EventSequenceTimerScreen}
          options={() => {
            const modelId = store.getState().eventSequence.modelId;
            const model = realm.objectForPrimaryKey('Model', new BSON.ObjectId(modelId)) as Model;
            const kind = eventKind(model ? model.type : undefined);
            return {
              title: `${kind.name} Timer`,
              headerLargeStyle: { backgroundColor: theme.colors.brandPrimary },
              headerTitleStyle: { color: theme.colors.stickyWhite },
              headerTintColor: theme.colors.stickyWhite,
              headerShadowVisible: false,
            }
          }}
        />
        <EventSequenceStack.Screen
          name='BatteryCellValuesEditor'
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
