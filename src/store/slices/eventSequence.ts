import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ChecklistType, EventSequenceChecklistType } from 'types/checklist';

import { JChecklistActionHistoryEntry } from 'realmdb/Checklist';
import { revertAll } from 'store/actions';

type EventSequenceChecklistActionHistoryEntries = {
  [key in EventSequenceChecklistType]: Record<string, JChecklistActionHistoryEntry>;
};

export interface EventSequenceState {
  modelId?: string;
  batteryIds: string[];
  checklistActionHistoryEntries: EventSequenceChecklistActionHistoryEntries;
  duration: number;
}

export const initialEventSequenceState = Object.freeze<EventSequenceState>({
  modelId: undefined,
  batteryIds: [],
  checklistActionHistoryEntries: {
    [ChecklistType.PreEvent]: {},
    [ChecklistType.PostEvent]: {},
  },
  duration: 0,
});

const handleReset: CaseReducer<EventSequenceState> = _state => {
  return initialEventSequenceState;
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

const handleSetDuration: CaseReducer<EventSequenceState, PayloadAction<{ duration: number }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    duration: payload.duration,
  };
};

const handleSetModel: CaseReducer<EventSequenceState, PayloadAction<{ modelId: string }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    modelId: payload.modelId,
  };
};

const handleSetChecklistActionComplete: CaseReducer<
  EventSequenceState,
  PayloadAction<{
    checklistActionRefId: string;
    checklistActionHistoryEntry: JChecklistActionHistoryEntry;
    checklistType: EventSequenceChecklistType;
  }>
> = (state, { payload }) => {
  return {
    ...state,
    checklistActionHistoryEntries: {
      ...state.checklistActionHistoryEntries,
      [payload.checklistType]: {
        ...state.checklistActionHistoryEntries[payload.checklistType],
        [payload.checklistActionRefId]: payload.checklistActionHistoryEntry,
      },
    },
  };
};

const handleSetChecklistActionNotComplete: CaseReducer<
  EventSequenceState,
  PayloadAction<{
    checklistActionRefId: string;
    checklistType: EventSequenceChecklistType;
  }>
> = (state, { payload }) => {
  const entries = Object.assign({}, state.checklistActionHistoryEntries[payload.checklistType]);
  delete entries[payload.checklistActionRefId];
  return {
    ...state,
    checklistActionHistoryEntries: {
      ...state.checklistActionHistoryEntries,
      [payload.checklistType]: entries,
    },
  };
};

const eventSequenceSlice = createSlice({
  name: 'eventSequence',
  initialState: initialEventSequenceState,
  extraReducers: builder => builder.addCase(revertAll, () => initialEventSequenceState),
  reducers: {
    reset: handleReset,
    setBatteries: handleSetBatteries,
    setDuration: handleSetDuration,
    setChecklistActionComplete: handleSetChecklistActionComplete,
    setChecklistActionNotComplete: handleSetChecklistActionNotComplete,
    setModel: handleSetModel,
  },
});

export const eventSequenceReducer = eventSequenceSlice.reducer;
export const eventSequence = eventSequenceSlice.actions;
