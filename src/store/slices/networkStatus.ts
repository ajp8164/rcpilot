import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { NetInfoStateType } from '@react-native-community/netinfo';
import { revertSettings } from 'store/actions';

export interface NetworkStatusState {
  internet: {
    connected: boolean;
    connectionType: NetInfoStateType;
  };
}

export const initialNetworkStatusState = Object.freeze<NetworkStatusState>({
  internet: {
    connected: false,
    connectionType: NetInfoStateType.none,
  },
});

const handleSaveInternetStatus: CaseReducer<
  NetworkStatusState,
  PayloadAction<{ connected: boolean; connectionType: NetInfoStateType }>
> = (state, { payload }) => {
  return {
    ...state,
    internet: payload,
  };
};

const networkStatusSlice = createSlice({
  name: 'networkStatus',
  initialState: initialNetworkStatusState,
  extraReducers: builder =>
    builder.addCase(revertSettings, () => initialNetworkStatusState),
  reducers: {
    saveInternetStatus: handleSaveInternetStatus,
  },
});

export const networkStatusReducer = networkStatusSlice.reducer;
export const saveInternetStatus = networkStatusSlice.actions.saveInternetStatus;
