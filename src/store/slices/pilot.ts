import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { revertAll } from 'store/actions';

export interface PilotState {
  pilotId?: string;
}

export const initialPilotState = Object.freeze<PilotState>({
  pilotId: undefined,
});

const handleSaveSelectedPilot: CaseReducer<PilotState, PayloadAction<{ pilotId?: string }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    pilotId: payload.pilotId,
  };
};

const pilotSlice = createSlice({
  name: 'pilot',
  initialState: initialPilotState,
  extraReducers: builder => builder.addCase(revertAll, () => initialPilotState),
  reducers: {
    saveSelectedPilot: handleSaveSelectedPilot,
  },
});

export const pilotReducer = pilotSlice.reducer;
export const saveSelectedPilot = pilotSlice.actions.saveSelectedPilot;
