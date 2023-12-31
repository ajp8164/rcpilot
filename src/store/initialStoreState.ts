import {
  AppSettingsState,
  initialAppSettingsState,
} from 'store/slices/appSettings';
import { AppState, initialAppState } from 'store/slices/app';
import {
  NetworkStatusState,
  initialNetworkStatusState,
} from 'store/slices/networkStatus';
import { PilotState, initialPilotState } from 'store/slices/pilot';
import { UserState, initialUserState } from 'store/slices/user';

export interface StoreState {
  app: AppState;
  appSettings: AppSettingsState;
  networkStatus: NetworkStatusState;
  pilot: PilotState;
  user: UserState;
}

export const initialStoreState = Object.freeze<StoreState>({
  app: initialAppState,
  appSettings: initialAppSettingsState,
  networkStatus: initialNetworkStatusState,
  pilot: initialPilotState,
  user: initialUserState,
});
