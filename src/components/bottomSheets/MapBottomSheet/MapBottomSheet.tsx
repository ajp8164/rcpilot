import React, { useImperativeHandle, useRef } from 'react';
import { Dimensions, type ViewStyle } from 'react-native';

import BottomSheet, {
  BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import { Divider, ThemeManager } from '@react-native-hello/ui';
import { GlassBackground } from 'components/atoms/GlassBackground';
import { ModalHeader } from 'components/atoms/ModalHeader';
import LocationsView from 'components/views/LocationsView';
import MapActionsView from 'components/views/MapActionsView';

import { MapBottomSheetMethods, MapBottomSheetProps } from './types';

const screenHeight = Dimensions.get('window').height;
const PEEK_SNAP = 65;
const MID_SNAP = 0.4; // 40% of screen height
const MAX_SNAP = 0.92; // 92% of screen height
const SNAP_POINTS = [PEEK_SNAP, `${MID_SNAP * 100}%`, `${MAX_SNAP * 100}%`];

type MapBottomSheet = MapBottomSheetMethods;

const MapBottomSheet = React.forwardRef<MapBottomSheet, MapBottomSheetProps>(
  (props, ref) => {
    const { animatedPosition, topInset = 0, onPressAddLocation } = props;

    const s = useStyles();
    const innerRef = useRef<BottomSheet>(null);
    const fullY = topInset + 44;

    useImperativeHandle(ref, () => ({
      dismiss,
      present,
    }));

    const dismiss = () => {
      innerRef.current?.snapToIndex(0);
    };

    const present = () => {
      innerRef.current?.snapToIndex(1);
    };

    // Background: glass blur base with animated opacity overlay that
    // transitions to solid background as the sheet expands fully.
    const midY = screenHeight * (1 - MID_SNAP);
    const Background = React.useCallback(
      ({ style, animatedPosition: pos }: BottomSheetBackgroundProps) => (
        <GlassBackground
          animatedPosition={pos}
          fullY={fullY}
          midY={midY}
          peekY={screenHeight - PEEK_SNAP}
          style={style as ViewStyle}
        />
      ),
      [fullY, midY],
    );

    return (
      <BottomSheet
        ref={innerRef}
        animatedPosition={animatedPosition}
        snapPoints={SNAP_POINTS}
        topInset={fullY}
        index={0}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        handleIndicatorStyle={s.handleIndicator}
        backgroundComponent={Background}>
        <ModalHeader
          size={'small'}
          title={'All Locations'}
          titleStyle={s.title}
        />
        <LocationsView
          ListHeaderComponent={
            <>
              <MapActionsView onPressAddLocation={onPressAddLocation} />
              <Divider />
            </>
          }
        />
      </BottomSheet>
    );
  },
);

export { MapBottomSheet };

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  handleIndicator: {
    backgroundColor: theme.colors.lightGray,
  },
  title: {
    alignSelf: 'flex-start',
  },
}));
