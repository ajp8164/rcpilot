import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions, Text, type ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  Divider,
  ListItem,
  ListItemCheckBox,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { useQuery } from '@realm/react';
import { GlassBackground } from 'components/atoms/GlassBackground';
import { ModalHeader } from 'components/atoms/ModalHeader';
import MapActionsView from 'components/views/MapActionsView';
import { Globe, Goal, LandPlot } from 'lucide-react-native';
import { Location } from 'realmdb';
import { selectLocation as _selectLocation } from 'store/selectors/locationSelectors';
import { LocationPickerResult } from 'types/location';

import { MapBottomSheetMethods, MapBottomSheetProps } from './types';

const screenHeight = Dimensions.get('window').height;
const PEEK_SNAP = 65;
const MID_SNAP = 0.4;
const SNAP_POINTS = [PEEK_SNAP, `${MID_SNAP * 100}%`, '80%'];

type MapBottomSheet = MapBottomSheetMethods;

const MapBottomSheet = React.forwardRef<MapBottomSheet, MapBottomSheetProps>(
  (props, ref) => {
    const {
      animatedPosition,
      topInset = 0,
      onPressAddLocation,
      onPressClubs,
      onSnapChange,
    } = props;

    const theme = useTheme();
    const s = useStyles();
    const event = useEvent();
    const innerRef = useRef<BottomSheet>(null);
    const fullY = topInset + 44;

    // Locations state - only show user-created locations.
    const currentLocationId = useSelector(_selectLocation).locationId;
    const manualLocations = useQuery(Location, locs => {
      return locs.filtered('kind == "user"');
    });

    const [selectedLocation, setSelectedLocation] = useState(currentLocationId);

    useEffect(() => {
      event.on('map-location', onChangeMapLocation);
      return () => {
        event.removeListener('map-location', onChangeMapLocation);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChangeMapLocation = (result: LocationPickerResult) => {
      setSelectedLocation(result.locationId);
    };

    const selectLocation = (location: Location) => {
      const id = location._id.toString();
      setSelectedLocation(id);
      event.emit('select-map-location', { locationId: id } as LocationPickerResult);
    };

    useImperativeHandle(ref, () => ({
      dismiss,
      present,
      snapToIndex,
    }));

    const dismiss = () => {
      innerRef.current?.snapToIndex(0);
    };

    const present = () => {
      innerRef.current?.snapToIndex(1);
    };

    const snapToIndex = (index: number) => {
      innerRef.current?.snapToIndex(index);
    };

    // Background
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
        index={1}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        handleIndicatorStyle={s.handleIndicator}
        onChange={onSnapChange}
        backgroundComponent={Background}>
        <ModalHeader
          size={'small'}
          title={'Locations'}
          titleStyle={s.titleLeft}
        />
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.contentContainer}>
          {/* Action buttons */}
          <MapActionsView onPressAddLocation={onPressAddLocation} />
          <Divider />
          {/* Manual locations */}
          {manualLocations.length > 0 ? (
            manualLocations.map((location, index) => {
              const currentLocation =
                location._id.toString() === currentLocationId;
              return (
                <ListItemCheckBox
                  key={location._id.toString()}
                  title={location.name}
                  subtitle={currentLocation ? 'Current location' : null}
                  leftContent={
                    currentLocation ? (
                      <Goal color={theme.colors.listItemIcon} />
                    ) : (
                      <LandPlot color={theme.colors.listItemIcon} />
                    )
                  }
                  position={listItemPosition(index, manualLocations.length)}
                  checked={location._id.toString() === selectedLocation}
                  onChange={() => selectLocation(location)}
                />
              );
            })
          ) : (
            <Text style={s.emptyMessage}>
              {'No locations. Tap Add Location or press on the map.'}
            </Text>
          )}
          <Divider />
          {/* Clubs nav item */}
          <ListItem
            title={'Club Finder'}
            leftContent={<Globe color={theme.colors.listItemIcon} />}
            position={['first', 'last']}
            rightContent={'chevron-right'}
            onPress={onPressClubs}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

export { MapBottomSheet };

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  contentContainer: {
    paddingHorizontal: theme.spacing.M,
  },
  emptyMessage: {
    ...theme.text.small,
    color: theme.colors.disabled,
    textAlign: 'center',
    paddingVertical: 20,
  },
  handleIndicator: {
    backgroundColor: theme.colors.lightGray,
  },
  titleLeft: {
    alignSelf: 'flex-start',
  },
}));
