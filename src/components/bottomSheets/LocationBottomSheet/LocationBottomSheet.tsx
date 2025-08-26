import React, { useImperativeHandle, useRef, useState } from 'react';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import IconCloseX from 'components/atoms/IconCloseX';
import LocationView from 'components/views/LocationView';

import { LocationBottomSheetMethods, LocationBottomSheetProps } from './types';

type LocationBottomSheet = LocationBottomSheetMethods;

const LocationBottomSheet = React.forwardRef<
  LocationBottomSheet,
  LocationBottomSheetProps
>((props, ref) => {
  const { onDismiss, onPressNotes, snapPoints = [150, '45%', '92%'] } = props;

  const theme = useTheme();
  const s = useStyles();
  const [locationId, setLocationId] = useState<string>();

  const innerRef = useRef<BottomSheet>(null);

  useImperativeHandle(ref, () => ({
    // These functions exposed to the parent component through the ref.
    dismiss,
    present,
  }));

  const dismiss = (byUser?: boolean) => {
    innerRef.current?.close();
    onDismiss?.(byUser);
  };

  const present = (locationId: string) => {
    setLocationId(locationId);
    innerRef.current?.snapToIndex(0);
  };

  return (
    <BottomSheet
      ref={innerRef}
      index={-1}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: theme.colors.viewBackground }}>
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
  );
});

const useStyles = ThemeManager.createStyleSheet(() => ({
  container: {
    marginTop: -15,
  },
}));

export { LocationBottomSheet };
