import { StoreState } from 'store/initialStoreState';
import { createSelector } from '@reduxjs/toolkit';

export const selectAppState = (state: StoreState): StoreState => state;

export const selectAppSettings = createSelector(selectAppState, appState => {
  return appState.appSettings;
});

export const selectBiometrics = createSelector(selectAppState, appState => {
  return appState.appSettings.biometrics;
});

export const selectDatabaseAccessWith = createSelector(selectAppState, appState => {
  return appState.appSettings.databaseAccessWith;
});

export const selectModelPreferences = (modelId: string) =>
  createSelector(selectAppState, appState => {
    return appState.appSettings.modelsPreferences[modelId];
  });

export const selectModelsLayout = createSelector(selectAppState, appState => {
  return appState.appSettings.modelsLayout;
});

export const selectModelsPreferences = createSelector(selectAppState, appState => {
  return appState.appSettings.modelsPreferences;
});

export const selectOutputReportTo = createSelector(selectAppState, appState => {
  return appState.appSettings.outputReportTo;
});

export const selectThemeSettings = createSelector(selectAppState, appState => {
  return appState.appSettings.themeSettings;
});

export const selectTou = createSelector(selectAppState, appState => {
  return appState.appSettings.tou;
});
