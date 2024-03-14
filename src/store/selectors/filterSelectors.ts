import { FilterType } from 'types/filter';
import { StoreState } from 'store/initialStoreState';
import { createSelector } from '@reduxjs/toolkit';

export const selectAppState = (state: StoreState): StoreState => state;

export const selectFilters = (filterType: FilterType) => createSelector(selectAppState, appState => {
  return appState.filters.filterId[filterType];
});
