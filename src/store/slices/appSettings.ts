import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { DatabaseAccessWith, OutputReportTo } from 'types/database';

import { ThemeSettings } from 'types/theme';
import { Tou } from 'types/tou';
import { revertSettings } from 'store/actions';
import { ModelsLayout } from 'types/preferences';

export interface AppSettingsState {
  biometrics: boolean;
  databaseAccessWith: DatabaseAccessWith;
  outputReportTo: OutputReportTo;
  modelsLayout: ModelsLayout;
  themeSettings: ThemeSettings;
  tou: Tou;
}

export const initialAppSettingsState = Object.freeze<AppSettingsState>({
  biometrics: true,
  databaseAccessWith: DatabaseAccessWith.WebServer,
  outputReportTo: OutputReportTo.WebServer,
  modelsLayout: ModelsLayout.List,
  themeSettings: {
    followDevice: true,
    app: 'light',
  },
  tou: {
    accepted: undefined,
  },
});

const handleSaveBiometrics: CaseReducer<AppSettingsState, PayloadAction<{ value: boolean }>> = (
  state,
  { payload },
) => {
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

const handleSaveThemeSettings: CaseReducer<
  AppSettingsState,
  PayloadAction<{ themeSettings: ThemeSettings }>
> = (state, { payload }) => {
  return {
    ...state,
    themeSettings: payload.themeSettings,
  };
};

const handleSaveAcceptTou: CaseReducer<AppSettingsState, PayloadAction<{ tou: Tou }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    tou: payload.tou,
  };
};

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState: initialAppSettingsState,
  extraReducers: builder => builder.addCase(revertSettings, () => initialAppSettingsState),
  reducers: {
    saveAcceptTou: handleSaveAcceptTou,
    saveBiometrics: handleSaveBiometrics,
    saveDatabaseAccessWith: handleSaveDatabaseAccessWith,
    saveOutputReportTo: handleSaveOutputReportTo,
    saveModelsLayout: handleSaveModelsLayout,
    saveThemeSettings: handleSaveThemeSettings,
  },
});

export const appSettingsReducer = appSettingsSlice.reducer;
export const saveAcceptTou = appSettingsSlice.actions.saveAcceptTou;
export const saveBiometrics = appSettingsSlice.actions.saveBiometrics;
export const saveDatabaseAccessWith = appSettingsSlice.actions.saveDatabaseAccessWith;
export const saveOutputReportTo = appSettingsSlice.actions.saveOutputReportTo;
export const saveModelsLayout = appSettingsSlice.actions.saveModelsLayout;
export const saveThemeSettings = appSettingsSlice.actions.saveThemeSettings;
