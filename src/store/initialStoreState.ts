import { AppSettingsState, initialAppSettingsState } from 'store/slices/appSettings';
import { AppState, initialAppState } from 'store/slices/app';
import { EventSequenceState, initialEventSequenceState } from 'store/slices/eventSequence';
import { FiltersState, initialFiltersState } from 'store/slices/filters';
import { NetworkStatusState, initialNetworkStatusState } from 'store/slices/networkStatus';
import { PilotState, initialPilotState } from 'store/slices/pilot';
import { UserState, initialUserState } from 'store/slices/user';

export interface StoreState {
  app: AppState;
  appSettings: AppSettingsState;
  eventSequence: EventSequenceState;
  filters: FiltersState;
  networkStatus: NetworkStatusState;
  pilot: PilotState;
  user: UserState;
}

export const initialStoreState = Object.freeze<StoreState>({
  app: initialAppState,
  appSettings: initialAppSettingsState,
  eventSequence: initialEventSequenceState,
  filters: initialFiltersState,
  networkStatus: initialNetworkStatusState,
  pilot: initialPilotState,
  user: initialUserState,
});
