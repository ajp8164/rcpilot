import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { DatabaseAccessWith, OutputReportTo } from 'types/database';

import { ThemeSettings } from 'types/theme';
import { Tou } from 'types/tou';
import { revertSettings } from 'store/actions';
import {
  ModelPreferences,
  ModelsPreferences,
  ModelsLayout,
} from 'types/preferences';

export interface AppSettingsState {
  biometrics: boolean;
  databaseAccessWith: DatabaseAccessWith;
  outputReportTo: OutputReportTo;
  modelsLayout: ModelsLayout;
  modelsPreferences: ModelsPreferences;
  themeSettings: ThemeSettings;
  tou: Tou;
}

export const initialAppSettingsState = Object.freeze<AppSettingsState>({
  biometrics: true,
  databaseAccessWith: DatabaseAccessWith.WebServer,
  outputReportTo: OutputReportTo.WebServer,
  modelsLayout: ModelsLayout.List,
  modelsPreferences: {},
  themeSettings: {
    followDevice: true,
    app: 'light',
  },
  tou: {
    accepted: undefined,
  },
});

const handleSaveBiometrics: CaseReducer<
  AppSettingsState,
  PayloadAction<{ value: boolean }>
> = (state, { payload }) => {
  return {
    ...state,
    biometrics: payload.value,
  };
};

const handleSaveDatabaseAccessWith: CaseReducer<
  AppSettingsState,
  PayloadAction<{ value: DatabaseAccessWith }>
> = (state, { payload }) => {
  return {
    ...state,
    databaseAccessWith: payload.value,
  };
};

const handleSaveOutputReportTo: CaseReducer<
  AppSettingsState,
  PayloadAction<{ value: OutputReportTo }>
> = (state, { payload }) => {
  return {
    ...state,
    outputReportTo: payload.value,
  };
};

const handleSaveModelsLayout: CaseReducer<
  AppSettingsState,
  PayloadAction<{ presentation: ModelsLayout }>
> = (state, { payload }) => {
  return {
    ...state,
    modelsLayout: payload.presentation,
  };
};

const handleDeleteModelPreferences: CaseReducer<
  AppSettingsState,
  PayloadAction<{ modelId: string }>
> = (state, { payload }) => {
  const updatedModelsPreferences = Object.assign({}, state.modelsPreferences);
  delete updatedModelsPreferences[payload.modelId];
  return {
    ...state,
    modelsPreferences: updatedModelsPreferences,
  };
};

const handleSaveModelPreferences: CaseReducer<
  AppSettingsState,
  PayloadAction<{ modelId: string; props: ModelPreferences }>
> = (state, { payload }) => {
  const updatedModelsPreferences = Object.assign({}, state.modelsPreferences);
  updatedModelsPreferences[payload.modelId] = payload.props;
  return {
    ...state,
    modelsPreferences: updatedModelsPreferences,
  };
};

const handleSaveThemeSettings: CaseReducer<
  AppSettingsState,
  PayloadAction<{ themeSettings: ThemeSettings }>
> = (state, { payload }) => {
  return {
    ...state,
    themeSettings: payload.themeSettings,
  };
};

const handleSaveAcceptTou: CaseReducer<
  AppSettingsState,
  PayloadAction<{ tou: Tou }>
> = (state, { payload }) => {
  return {
    ...state,
    tou: payload.tou,
  };
};

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState: initialAppSettingsState,
  extraReducers: builder =>
    builder.addCase(revertSettings, () => initialAppSettingsState),
  reducers: {
    deleteModelPreferences: handleDeleteModelPreferences,
    saveAcceptTou: handleSaveAcceptTou,
    saveBiometrics: handleSaveBiometrics,
    saveDatabaseAccessWith: handleSaveDatabaseAccessWith,
    saveOutputReportTo: handleSaveOutputReportTo,
    saveModelsLayout: handleSaveModelsLayout,
    saveModelPreferences: handleSaveModelPreferences,
    saveThemeSettings: handleSaveThemeSettings,
  },
});

export const appSettingsReducer = appSettingsSlice.reducer;
export const deleteModelPreferences =
  appSettingsSlice.actions.deleteModelPreferences;
export const saveAcceptTou = appSettingsSlice.actions.saveAcceptTou;
export const saveBiometrics = appSettingsSlice.actions.saveBiometrics;
export const saveDatabaseAccessWith =
  appSettingsSlice.actions.saveDatabaseAccessWith;
export const saveOutputReportTo = appSettingsSlice.actions.saveOutputReportTo;
export const saveModelsLayout = appSettingsSlice.actions.saveModelsLayout;
export const saveModelPreferences =
  appSettingsSlice.actions.saveModelPreferences;
export const saveThemeSettings = appSettingsSlice.actions.saveThemeSettings;
