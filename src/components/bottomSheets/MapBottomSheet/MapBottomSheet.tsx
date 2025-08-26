import React, { useImperativeHandle, useRef } from 'react';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-native-hello/ui';
import MapActionsView from 'components/views/MapActionsView';

import { MapBottomSheetMethods, MapBottomSheetProps } from './types';

type MapBottomSheet = MapBottomSheetMethods;

const MapBottomSheet = React.forwardRef<MapBottomSheet, MapBottomSheetProps>(
  (props, ref) => {
    const { initialIndex = 0, snapPoints = [150, '45%', '92%'] } = props;

    const theme = useTheme();

    const innerRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
      // These functions exposed to the parent component through the ref.
      collapse,
      dismiss,
      present,
    }));

    const collapse = () => {
      innerRef.current?.collapse();
    };

    const dismiss = () => {
      innerRef.current?.close();
    };

    const present = () => {
      innerRef.current?.snapToIndex(2);
    };

    return (
      <BottomSheet
        ref={innerRef}
        snapPoints={snapPoints}
        index={initialIndex}
        backgroundStyle={{ backgroundColor: theme.colors.viewBackground }}>
        <BottomSheetScrollView>
          <MapActionsView />
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

export { MapBottomSheet };
