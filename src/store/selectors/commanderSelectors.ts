import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from 'store/initialStoreState';

export const selectAppState = (state: StoreState): StoreState => state;

export const selectCommander = createSelector(selectAppState, appState => {
  return appState.commander;
});
