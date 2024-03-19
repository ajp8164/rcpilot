import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { revertAll } from 'store/actions';

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
    pilotId: payload.locationId,
  };
};

const locationSlice = createSlice({
  name: 'location',
  initialState: initialLocationState,
  extraReducers: builder => builder.addCase(revertAll, () => initialLocationState),
  reducers: {
    saveCurrentLocation: handleSaveCurrentLocation,
  },
});

export const locationReducer = locationSlice.reducer;
export const saveCurrentLocation = locationSlice.actions.saveCurrentLocation;
