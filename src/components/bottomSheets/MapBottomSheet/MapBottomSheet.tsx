import React, { useImperativeHandle, useRef } from 'react';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Divider, useTheme } from '@react-native-hello/ui';
import IconCloseX from 'components/atoms/IconCloseX';
import { ModalHeader } from 'components/atoms/ModalHeader';
import LocationsView from 'components/views/LocationsView';
import MapActionsView from 'components/views/MapActionsView';

import { MapBottomSheetMethods, MapBottomSheetProps } from './types';

type MapBottomSheet = MapBottomSheetMethods;

const MapBottomSheet = React.forwardRef<MapBottomSheet, MapBottomSheetProps>(
  (props, ref) => {
    const { onPressAddLocation } = props;

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
      innerRef.current?.snapToIndex(0);
    };

    return (
      <BottomSheet
        ref={innerRef}
        snapPoints={['40%', '92%']}
        index={-1}
        enableDynamicSizing={false}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: theme.colors.viewBackground }}>
        <ModalHeader
          size={'small'}
          title={'All Locations'}
          titleStyle={{ alignSelf: 'flex-start' }}
          containerStyle={{ backgroundColor: theme.colors.viewBackground }}
          rightButtonIcon={<IconCloseX />}
          onRightButtonPress={dismiss}
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
