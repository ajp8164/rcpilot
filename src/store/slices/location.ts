import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { revertSettings } from 'store/actions';

export interface LocationState {
  locationId?: string;
}

export const initialLocationState = Object.freeze<LocationState>({
  locationId: undefined,
});

const handleSaveCurrentLocation: CaseReducer<
  LocationState,
  PayloadAction<{ locationId?: string }>
> = (state, { payload }) => {
  return {
    ...state,
    locationId: payload.locationId,
  };
};

const locationSlice = createSlice({
  name: 'location',
  initialState: initialLocationState,
  extraReducers: builder =>
    builder.addCase(revertSettings, () => initialLocationState),
  reducers: {
    saveCurrentLocation: handleSaveCurrentLocation,
  },
});

export const locationReducer = locationSlice.reducer;
export const saveCurrentLocation = locationSlice.actions.saveCurrentLocation;
