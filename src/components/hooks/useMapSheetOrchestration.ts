import { useRef } from 'react';
import { useDerivedValue, useSharedValue, SharedValue } from 'react-native-reanimated';

import { ClubBottomSheet } from 'components/bottomSheets/ClubBottomSheet';
import { ClubsBottomSheet } from 'components/bottomSheets/ClubsBottomSheet';
import { MapBottomSheet } from 'components/bottomSheets/MapBottomSheet';

export type SheetMode =
  | { type: 'idle' }
  | { type: 'clubs_search'; mapSnapIndex: number }
  | { type: 'club_detail'; source: 'search' | 'callout'; mapSnapIndex: number; clubsSnapIndex: number }
  | { type: 'location_detail'; mapSnapIndex: number }
  | { type: 'adding_location'; mapSnapIndex: number };

interface SheetRefs {
  mapBottomSheetRef: React.RefObject<MapBottomSheet | null>;
  clubsBottomSheetRef: React.RefObject<ClubsBottomSheet | null>;
  clubBottomSheetRef: React.RefObject<ClubBottomSheet | null>;
}

export interface SheetOrchestration {
  sheetMode: React.RefObject<SheetMode>;
  mapSheetUserIndex: React.RefObject<number>;
  bottomSheetPosition: SharedValue<number>;
  locationSheetPosition: SharedValue<number>;
  clubSheetPosition: SharedValue<number>;
  clubsSearchSheetPosition: SharedValue<number>;
  buttonTrackingPosition: Readonly<SharedValue<number>>;
  setSheetMode: (mode: SheetMode) => void;
  onMapSheetSnapChange: (index: number) => void;
  onClubBottomSheetDismiss: () => void;
  onClubsBottomSheetDismiss: () => void;
}

export const useMapSheetOrchestration = (refs: SheetRefs): SheetOrchestration => {
  const { mapBottomSheetRef, clubsBottomSheetRef } = refs;

  const bottomSheetPosition = useSharedValue(475);
  const locationSheetPosition = useSharedValue(0);
  const clubSheetPosition = useSharedValue(0);
  const clubsSearchSheetPosition = useSharedValue(0);

  // Determines which sheet the action buttons track.
  // 0 = map sheet, 1 = location/adding sheet, 2 = club detail sheet, 3 = clubs search sheet.
  const activeSheetSource = useSharedValue(0);

  const buttonTrackingPosition = useDerivedValue(() => {
    switch (activeSheetSource.value) {
      case 1: return locationSheetPosition.value;
      case 2: return clubSheetPosition.value;
      case 3: return clubsSearchSheetPosition.value;
      default: return bottomSheetPosition.value;
    }
  });

  const sheetMode = useRef<SheetMode>({ type: 'idle' });
  const mapSheetUserIndex = useRef(1);

  // Transition the sheet state machine. Updates mode and button tracking source atomically.
  const setSheetMode = (mode: SheetMode) => {
    sheetMode.current = mode;
    switch (mode.type) {
      case 'location_detail':
      case 'adding_location':
        activeSheetSource.value = 1;
        break;
      case 'club_detail':
        activeSheetSource.value = 2;
        break;
      case 'clubs_search':
        activeSheetSource.value = 3;
        break;
      default:
        activeSheetSource.value = 0;
    }
  };

  const onMapSheetSnapChange = (index: number) => {
    if (sheetMode.current.type === 'idle') {
      mapSheetUserIndex.current = index;
    }
  };

  const onClubBottomSheetDismiss = () => {
    const mode = sheetMode.current;
    if (mode.type !== 'club_detail') return; // Another flow took over.
    if (mode.source === 'search') {
      setSheetMode({ type: 'clubs_search', mapSnapIndex: mode.mapSnapIndex });
      clubsBottomSheetRef.current?.snapToIndex(mode.clubsSnapIndex);
    } else {
      // Callout source. If clubs sheet is still visible, return to clubs_search.
      const clubsIndex = clubsBottomSheetRef.current?.getCurrentIndex?.();
      if (clubsIndex !== undefined && clubsIndex >= 0) {
        setSheetMode({ type: 'clubs_search', mapSnapIndex: mode.mapSnapIndex });
      } else {
        setSheetMode({ type: 'idle' });
        mapBottomSheetRef.current?.snapToIndex(mode.mapSnapIndex);
      }
    }
  };

  const onClubsBottomSheetDismiss = () => {
    const mode = sheetMode.current;
    if (mode.type !== 'clubs_search') return; // Another flow took over.
    setSheetMode({ type: 'idle' });
    mapBottomSheetRef.current?.snapToIndex(mode.mapSnapIndex);
  };

  return {
    sheetMode,
    mapSheetUserIndex,
    bottomSheetPosition,
    locationSheetPosition,
    clubSheetPosition,
    clubsSearchSheetPosition,
    buttonTrackingPosition,
    setSheetMode,
    onMapSheetSnapChange,
    onClubBottomSheetDismiss,
    onClubsBottomSheetDismiss,
  };
};
