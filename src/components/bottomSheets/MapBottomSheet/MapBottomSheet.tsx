import React, { useImperativeHandle, useRef } from 'react';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Divider, useTheme } from '@react-native-hello/ui';
import { ModalHeader } from 'components/atoms/ModalHeader';
import LocationsView from 'components/views/LocationsView';
import MapActionsView from 'components/views/MapActionsView';

import { MapBottomSheetMethods, MapBottomSheetProps } from './types';

type MapBottomSheet = MapBottomSheetMethods;

const MapBottomSheet = React.forwardRef<MapBottomSheet, MapBottomSheetProps>(
  (props, ref) => {
    const { animatedPosition, topInset = 0, onPressAddLocation } = props;

    const theme = useTheme();

    const innerRef = useRef<BottomSheet>(null);

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

    return (
      <BottomSheet
        ref={innerRef}
        animatedPosition={animatedPosition}
        snapPoints={[65, '40%', '92%']}
        topInset={topInset + 44}
        index={0}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: theme.colors.viewBackground }}>
        <ModalHeader
          size={'small'}
          title={'All Locations'}
          titleStyle={{ alignSelf: 'flex-start' }}
          containerStyle={{ backgroundColor: theme.colors.viewBackground }}
        />
        <BottomSheetScrollView
          style={theme.styles.view}
          showsVerticalScrollIndicator={false}>
          <MapActionsView onPressAddLocation={onPressAddLocation} />
          <Divider />
          <LocationsView />
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

export { MapBottomSheet };
