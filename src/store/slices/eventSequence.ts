import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { JChecklistActionHistoryEntry } from 'realmdb/Checklist';
import { revertAll } from 'store/actions';

export interface EventSequenceState {
  modelId?: string;
  batteryIds: string[];
  checklistActionHistoryEntries: Record<string, JChecklistActionHistoryEntry>;
}

export const initialEventSequenceState = Object.freeze<EventSequenceState>({
  modelId: undefined,
  batteryIds: [],
  checklistActionHistoryEntries: {},
});

const handleAddChecklistActionHistoryEntry: CaseReducer<
  EventSequenceState,
  PayloadAction<{
    checklistActionRefId: string,
    checklistActionHistortEntry: JChecklistActionHistoryEntry
  }>
> = (state, { payload }) => {
  return {
    ...state,
    checklistActionHistoryEntries: {
      ...state.checklistActionHistoryEntries,
      [payload.checklistActionRefId]: payload.checklistActionHistortEntry,
    }
  };
};

const handleReset: CaseReducer<
  EventSequenceState
> = (_state) => {
  return {
    modelId: undefined,
    batteryIds: [],
    checklistActionHistoryEntries: {},
  };
};

const handleSetBatteries: CaseReducer<
  EventSequenceState,
  PayloadAction<{ batteryIds: string[] }>
> = (state, { payload }) => {
  return {
    ...state,
    batteryIds: payload.batteryIds,
  };
};

const handleSetModel: CaseReducer<
  EventSequenceState,
  PayloadAction<{ modelId: string }>
> = (state, { payload }) => {
  return {
    ...state,
    modelId: payload.modelId,
  };
};

const handleSetChecklistActionNotes: CaseReducer<
  EventSequenceState,
  PayloadAction<{checklistActionRefId: string, text: string}>
> = (state, { payload }) => {
  const entry = Object.assign({}, state.checklistActionHistoryEntries[payload.checklistActionRefId]);
  entry.notes = payload.text;
  return {
    ...state,
    checklistActionHistoryEntries: {
      ...state.checklistActionHistoryEntries,
      [payload.checklistActionRefId]: entry,
    }
  };
};

const handleToggleChecklistActionComplete: CaseReducer<
  EventSequenceState,
  PayloadAction<{checklistActionRefId: string}>
> = (state, { payload }) => {
  const entry = Object.assign({}, state.checklistActionHistoryEntries[payload.checklistActionRefId]);
  entry.complete = !entry.complete;
  return {
    ...state,
    checklistActionHistoryEntries: {
      ...state.checklistActionHistoryEntries,
      [payload.checklistActionRefId]: entry,
    }
  };
};

const eventSequenceSlice = createSlice({
  name: 'eventSequence',
  initialState: initialEventSequenceState,
  extraReducers: builder =>
    builder.addCase(revertAll, () => initialEventSequenceState),
  reducers: {
    addChecklistActionHistoryEntry: handleAddChecklistActionHistoryEntry,
    reset: handleReset,
    setBatteries: handleSetBatteries,
    setChecklistActionNotes: handleSetChecklistActionNotes,
    setModel: handleSetModel,
    toggleChecklistActionComplete: handleToggleChecklistActionComplete,
  },
});

export const eventSequenceReducer = eventSequenceSlice.reducer;
export const eventSequence = eventSequenceSlice.actions;
