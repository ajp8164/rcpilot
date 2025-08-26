import React, { useImperativeHandle, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { BottomSheetFloatingButton } from 'components/atoms/BottomSheetFloatingButton';
import { Button } from 'components/atoms/Button';
import IconCloseX from 'components/atoms/IconCloseX';
import LocationView from 'components/views/LocationView';
import { MapPinCheck } from 'lucide-react-native';

import { LocationBottomSheetMethods, LocationBottomSheetProps } from './types';

type LocationBottomSheet = LocationBottomSheetMethods;

const LocationBottomSheet = React.forwardRef<
  LocationBottomSheet,
  LocationBottomSheetProps
>((props, ref) => {
  const {
    enableSelection,
    onDismiss,
    onLocationSelect,
    onPressNotes,
    snapPoints = [150, '45%', '85%'],
  } = props;

  const theme = useTheme();
  const s = useStyles();

  const [locationId, setLocationId] = useState<string>();

  const innerRef = useRef<BottomSheet>(null);
  const animatedPosition = useSharedValue(0);
  const [closed, setClosed] = useState(true);

  useImperativeHandle(ref, () => ({
    // These functions exposed to the parent component through the ref.
    dismiss,
    present,
  }));

  const dismiss = (byUser?: boolean) => {
    innerRef.current?.close();
    onDismiss?.(byUser);
    setClosed(true);
  };

  const present = (locationId: string) => {
    setLocationId(locationId);
    innerRef.current?.snapToIndex(0);
    setClosed(false);
  };

  const selectLocation = () => {
    locationId && onLocationSelect?.(locationId);
  };

  return (
    <>
      <BottomSheet
        ref={innerRef}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: theme.colors.viewBackground }}
        animatedPosition={animatedPosition}>
        <BottomSheetScrollView style={s.container}>
          <LocationView
            locationId={locationId}
            titleRightContent={
              <Button
                buttonStyle={theme.styles.dividerIconButton}
                icon={<IconCloseX />}
                onPress={() => dismiss(true)}
              />
            }
            onFocusName={() => innerRef.current?.expand()}
            onBlurName={() => innerRef.current?.snapToIndex(1)}
            onPressNotes={(text, title) => onPressNotes(text, title)}
          />
        </BottomSheetScrollView>
      </BottomSheet>
      {!closed && enableSelection ? (
        <BottomSheetFloatingButton
          animatedPosition={animatedPosition}
          title={'Select'}
          icon={<MapPinCheck color={theme.colors.stickyWhite} size={24} />}
          onPress={() => selectLocation()}
        />
      ) : null}
    </>
  );
});

const useStyles = ThemeManager.createStyleSheet(() => ({
  container: {
    marginTop: -15,
  },
}));

export { LocationBottomSheet };
