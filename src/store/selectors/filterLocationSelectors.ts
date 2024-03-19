import { StoreState } from 'store/initialStoreState';
import { createSelector } from '@reduxjs/toolkit';

export const selectAppState = (state: StoreState): StoreState => state;

export const selectLocation = () =>
  createSelector(selectAppState, appState => {
    return appState.location;
  });
