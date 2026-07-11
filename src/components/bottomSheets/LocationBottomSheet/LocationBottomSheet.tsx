import React, { useImperativeHandle, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { useRealm } from '@realm/react';
import { BottomSheetFloatingButton } from 'components/atoms/BottomSheetFloatingButton';
import IconCloseX from 'components/atoms/IconCloseX';
import { ModalHeader } from 'components/atoms/ModalHeader';
import LocationView, {
  LocationViewMethods,
} from 'components/views/LocationView';
import { MapPinCheck } from 'lucide-react-native';
import { BSON } from 'realm';
import { Location } from 'realmdb';

import { LocationBottomSheetMethods, LocationBottomSheetProps } from './types';

type LocationBottomSheet = LocationBottomSheetMethods;

const LocationBottomSheet = React.forwardRef<
  LocationBottomSheet,
  LocationBottomSheetProps
>((props, ref) => {
  const {
    enableSelection,
    initialIndex = -1,
    onDismiss,
    onLocationSelect,
    onPressNotes,
  } = props;

  const theme = useTheme();
  const s = useStyles();
  const realm = useRealm();

  const [location, setLocation] = useState<Location>();

  const innerRef = useRef<BottomSheet>(null);
  const locationViewRef = useRef<LocationViewMethods>(null);
  const animatedPosition = useSharedValue(0);
  const [closed, setClosed] = useState(true);

  useImperativeHandle(ref, () => ({
    // These functions exposed to the parent component through the ref.
    dismiss,
    getLocationId,
    present,
  }));

  const dismiss = (byUser?: boolean) => {
    innerRef.current?.close();
    onDismiss?.(byUser);
    setClosed(true);
    Keyboard.dismiss();

    // Reset state for next presentation.
    setLocation(undefined);
    locationViewRef.current?.setEditMode(false);
  };

  const present = (
    locationId: string,
    index?: number,
    showEditor?: boolean,
  ) => {
    const location = realm.objectForPrimaryKey(
      'Location',
      new BSON.ObjectId(locationId),
    ) as Location;

    setLocation(location);
    innerRef.current?.snapToIndex(index || 0);
    setClosed(false);

    // Wait for the view to appear before applying edit mode.
    requestAnimationFrame(() => {
      locationViewRef.current?.setEditMode(!!showEditor);
    });
  };

  // Returns the location id for this sheet if it is presented.
  const getLocationId = () => {
    return location?._id.toString();
  };

  const selectLocation = () => {
    if (location) onLocationSelect?.(location._id.toString());
  };

  return (
    <>
      <BottomSheet
        ref={innerRef}
        index={initialIndex}
        snapPoints={['40%', '80%']}
        enableDynamicSizing={false}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: theme.colors.viewBackground }}
        animatedPosition={animatedPosition}>
        <ModalHeader
          size={'small'}
          title={location?.name}
          titleStyle={{ alignSelf: 'flex-start' }}
          containerStyle={{ backgroundColor: theme.colors.viewBackground }}
          rightButtonIcon={<IconCloseX />}
          onRightButtonPress={dismiss}
        />
        <BottomSheetScrollView
          style={s.container}
          showsVerticalScrollIndicator={false}>
          {location?.isValid() ? (
            <LocationView
              ref={locationViewRef}
              locationId={location?._id.toString()}
              onFocusName={() => innerRef.current?.expand()}
              onBlurName={() => innerRef.current?.snapToIndex(1)}
              onDelete={() => dismiss()}
              onPressNotes={(text, title) => onPressNotes(text, title)}
            />
          ) : null}
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
