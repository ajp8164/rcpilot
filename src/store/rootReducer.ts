import { combineReducers } from '@reduxjs/toolkit';
import { appReducer } from 'store/slices/app';
import { appSettingsReducer } from 'store/slices/appSettings';
import { commanderReducer } from 'store/slices/commander';
import { eventSequenceReducer } from 'store/slices/eventSequence';
import { filtersReducer } from 'store/slices/filters';
import { locationReducer } from 'store/slices/location';
import { networkStatusReducer } from 'store/slices/networkStatus';
import { userReducer } from 'store/slices/user';

export const rootReducer = combineReducers({
  app: appReducer,
  appSettings: appSettingsReducer,
  eventSequence: eventSequenceReducer,
  filters: filtersReducer,
  location: locationReducer,
  networkStatus: networkStatusReducer,
  commander: commanderReducer,
  user: userReducer,
});
