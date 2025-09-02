import { AppState, initialAppState } from 'store/slices/app';
import {
  AppSettingsState,
  initialAppSettingsState,
} from 'store/slices/appSettings';
import { CommanderState, initialCommanderState } from 'store/slices/commander';
import {
  EventSequenceState,
  initialEventSequenceState,
} from 'store/slices/eventSequence';
import { FiltersState, initialFiltersState } from 'store/slices/filters';
import { LocationState, initialLocationState } from 'store/slices/location';
import {
  NetworkStatusState,
  initialNetworkStatusState,
} from 'store/slices/networkStatus';
import { UserState, initialUserState } from 'store/slices/user';

export interface StoreState {
  app: AppState;
  appSettings: AppSettingsState;
  commander: CommanderState;
  eventSequence: EventSequenceState;
  filters: FiltersState;
  location: LocationState;
  networkStatus: NetworkStatusState;
  user: UserState;
}

export const initialStoreState = Object.freeze<StoreState>({
  app: initialAppState,
  appSettings: initialAppSettingsState,
  commander: initialCommanderState,
  eventSequence: initialEventSequenceState,
  location: initialLocationState,
  filters: initialFiltersState,
  networkStatus: initialNetworkStatusState,
  user: initialUserState,
});
