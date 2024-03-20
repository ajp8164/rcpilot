import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { FilterType } from 'types/filter';
import { revertSettings } from 'store/actions';

export interface FiltersState {
  filterId: Record<FilterType, string | undefined>;
}

export const initialFiltersState = Object.freeze<FiltersState>({
  filterId: {
    [FilterType.BatteriesFilter]: undefined,
    [FilterType.BatteryCyclesFilter]: undefined,
    [FilterType.BypassFilter]: undefined,
    [FilterType.EventsBatteryPerformanceFilter]: undefined,
    [FilterType.EventsModelFilter]: undefined,
    [FilterType.MaintenanceFilter]: undefined,
    [FilterType.ModelsFilter]: undefined,
    [FilterType.ReportBatteryScanCodesFilter]: undefined,
    [FilterType.ReportEventsFilter]: undefined,
    [FilterType.ReportMaintenanceFilter]: undefined,
    [FilterType.ReportModelScanCodesFilter]: undefined,
  },
});

const handleSaveSelectedFilter: CaseReducer<
  FiltersState,
  PayloadAction<{
    filterType: FilterType;
    filterId?: string;
  }>
> = (state, { payload }) => {
  const filterId = Object.assign({}, state.filterId);
  filterId[payload.filterType] = payload.filterId;
  return {
    ...state,
    filterId,
  };
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState: initialFiltersState,
  extraReducers: builder => builder.addCase(revertSettings, () => initialFiltersState),
  reducers: {
    saveSelectedFilter: handleSaveSelectedFilter,
  },
});

export const filtersReducer = filtersSlice.reducer;
export const saveSelectedFilter = filtersSlice.actions.saveSelectedFilter;
