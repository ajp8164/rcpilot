import { appReducer } from 'store/slices/app';
import { appSettingsReducer } from 'store/slices/appSettings';
import { combineReducers } from '@reduxjs/toolkit';
import { eventSequenceReducer } from 'store/slices/eventSequence';
import { filtersReducer } from 'store/slices/filters';
import { networkStatusReducer } from 'store/slices/networkStatus';
import { pilotReducer } from 'store/slices/pilot';
import { userReducer } from 'store/slices/user';

export const rootReducer = combineReducers({
  app: appReducer,
  appSettings: appSettingsReducer,
  eventSequence: eventSequenceReducer,
  filters: filtersReducer,
  networkStatus: networkStatusReducer,
  pilot: pilotReducer,
  user: userReducer,
});
