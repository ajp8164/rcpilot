import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from 'store/initialStoreState';
import { FilterType } from 'types/filter';

export const selectAppState = (state: StoreState): StoreState => state;

export const selectFilters = (filterType: FilterType) =>
  createSelector(selectAppState, appState => {
    return appState.filters.filterId[filterType];
  });
