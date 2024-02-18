import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { revertAll } from 'store/actions';

export interface FiltersState {
  batteryFilterId?: string;
  batteryCycleFilterId?: string;
  eventFilterId?: string;
  flightFilterId?: string;
  maintenanceLogFilterId?: string;
  modelFilterId?: string;
}

export const initialFiltersState = Object.freeze<FiltersState>({
  batteryFilterId: undefined,
  batteryCycleFilterId: undefined,
  eventFilterId: undefined,
  flightFilterId: undefined,
  maintenanceLogFilterId: undefined,
  modelFilterId: undefined,
});

const handleSaveSelectedBatteryFilter: CaseReducer<FiltersState, PayloadAction<{ filterId?: string }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    batteryFilterId: payload.filterId,
  };
};

const handleSaveSelectedBatteryCycleFilter: CaseReducer<FiltersState, PayloadAction<{ filterId?: string }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    batteryCycleFilterId: payload.filterId,
  };
};

const handleSaveSelectedEventFilter: CaseReducer<FiltersState, PayloadAction<{ filterId?: string }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    eventFilterId: payload.filterId,
  };
};

const handleSaveSelectedMaintenanceFilter: CaseReducer<FiltersState, PayloadAction<{ filterId?: string }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    maintenanceFilterId: payload.filterId,
  };
};

const handleSaveSelectedModelFilter: CaseReducer<FiltersState, PayloadAction<{ filterId?: string }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    modelFilterId: payload.filterId,
  };
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState: initialFiltersState,
  extraReducers: builder => builder.addCase(revertAll, () => initialFiltersState),
  reducers: {
    saveSelectedBatteryFilter: handleSaveSelectedBatteryFilter,
    saveSelectedBatteryCycleFilter: handleSaveSelectedBatteryCycleFilter,
    saveSelectedEventFilter: handleSaveSelectedEventFilter,
    saveSelectedMaintenanceFilter: handleSaveSelectedMaintenanceFilter,
    saveSelectedModelFilter: handleSaveSelectedModelFilter,
  },
});

export const filtersReducer = filtersSlice.reducer;
export const saveSelectedBatteryFilter = filtersSlice.actions.saveSelectedBatteryFilter;
export const saveSelectedBatteryCycleFilter = filtersSlice.actions.saveSelectedBatteryCycleFilter;
export const saveSelectedEventFilter = filtersSlice.actions.saveSelectedEventFilter;
export const saveSelectedMaintenanceFilter = filtersSlice.actions.saveSelectedMaintenanceFilter;
export const saveSelectedModelFilter = filtersSlice.actions.saveSelectedModelFilter;
