import { StoreState } from 'store/initialStoreState';
import { createSelector } from '@reduxjs/toolkit';

export const selectAppState = (state: StoreState): StoreState => state;

export const selectPilot = createSelector(selectAppState, appState => {
  return appState.pilot;
});
