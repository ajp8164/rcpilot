import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { DatabaseAccessWith, OutputReportTo } from 'types/database';

import { ThemeSettings } from 'types/theme';
import { Tou } from 'types/tou';
import { revertSettings } from 'store/actions';

export interface AppSettingsState {
  biometrics: boolean;
  databaseAccessWith: DatabaseAccessWith;
  outputReportTo: OutputReportTo;
  showModelCards: boolean;
  themeSettings: ThemeSettings;
  tou: Tou;
}

export const initialAppSettingsState = Object.freeze<AppSettingsState>({
  biometrics: true,
  databaseAccessWith: DatabaseAccessWith.WebServer,
  outputReportTo: OutputReportTo.WebServer,
  showModelCards: true,
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

const handleSaveShowModelCards: CaseReducer<AppSettingsState, PayloadAction<{ value: boolean }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    showModelCards: payload.value,
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
    saveShowModelCards: handleSaveShowModelCards,
    saveThemeSettings: handleSaveThemeSettings,
  },
});

export const appSettingsReducer = appSettingsSlice.reducer;
export const saveAcceptTou = appSettingsSlice.actions.saveAcceptTou;
export const saveBiometrics = appSettingsSlice.actions.saveBiometrics;
export const saveDatabaseAccessWith = appSettingsSlice.actions.saveDatabaseAccessWith;
export const saveOutputReportTo = appSettingsSlice.actions.saveOutputReportTo;
export const saveShowModelCards = appSettingsSlice.actions.saveShowModelCards;
export const saveThemeSettings = appSettingsSlice.actions.saveThemeSettings;
