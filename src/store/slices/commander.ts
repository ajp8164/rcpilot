import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { revertSettings } from 'store/actions';

export interface CommanderState {
  commanderId?: string;
}

export const initialCommanderState = Object.freeze<CommanderState>({
  commanderId: undefined,
});

const handleSaveSelectedCommander: CaseReducer<
  CommanderState,
  PayloadAction<{ commanderId?: string }>
> = (state, { payload }) => {
  return {
    ...state,
    commanderId: payload.commanderId,
  };
};

const commanderSlice = createSlice({
  name: 'commander',
  initialState: initialCommanderState,
  extraReducers: builder =>
    builder.addCase(revertSettings, () => initialCommanderState),
  reducers: {
    saveSelectedCommander: handleSaveSelectedCommander,
  },
});

export const commanderReducer = commanderSlice.reducer;
export const saveSelectedCommander =
  commanderSlice.actions.saveSelectedCommander;
