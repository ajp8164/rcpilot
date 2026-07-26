import React, { useContext, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Dimensions, type ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  Divider,
  ListItem,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { useQuery } from '@realm/react';
import { GlassBackground } from 'components/atoms/GlassBackground';
import { ModalHeader } from 'components/atoms/ModalHeader';
import { EmptyView } from 'components/molecules/EmptyView';
import MapActionsView from 'components/views/MapActionsView';
import { Clock, LandPlot, Navigation } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { GeoPositionContext, distanceBetweenLocations } from 'lib/location';
import { Location } from 'realmdb';
import { Event } from 'realmdb/Event';
import { selectLocation as _selectLocation } from 'store/selectors/locationSelectors';
import { LocationPickerResult } from 'types/location';

import { MapBottomSheetMethods, MapBottomSheetProps } from './types';

const screenHeight = Dimensions.get('window').height;
const PEEK_SNAP = 65;
const MID_SNAP = 0.4;
const SNAP_POINTS = [PEEK_SNAP, `${MID_SNAP * 100}%`, '80%'];
const RECENT_LOCATIONS_EVENT_LIMIT = 50;

type MapBottomSheet = MapBottomSheetMethods;

const MapBottomSheet = React.forwardRef<MapBottomSheet, MapBottomSheetProps>(
  (props, ref) => {
    const {
      animatedPosition,
      initialIndex = 1,
      topInset = 0,
      onPressAddLocation,
      onPressClubs,
      onPressRecentLocation,
      onSnapChange,
    } = props;

    const theme = useTheme();
    const s = useStyles();
    const event = useEvent();
    const innerRef = useRef<BottomSheet>(null);
    const fullY = topInset + 44;

    // Recent locations - last 3 unique locations from events, most recent first.
    const allEvents = useQuery(Event, events => {
      return events.sorted('createdOn', true);
    });

    const recentLocations = useMemo(() => {
      const seen = new Set<string>();
      const result: { location: Location; date: string }[] = [];
      let checked = 0;
      for (const ev of allEvents) {
        if (checked >= RECENT_LOCATIONS_EVENT_LIMIT) break;
        checked++;
        if (!ev.location) continue;
        const id = ev.location._id.toString();
        if (seen.has(id)) continue;
        seen.add(id);
        result.push({ location: ev.location, date: ev.date });
        if (result.length >= 3) break;
      }
      return result;
    }, [allEvents]);

    // Locations state - only show user-created locations.
    const currentLocationId = useSelector(_selectLocation).locationId;
    const currentPosition = useContext(GeoPositionContext);
    const manualLocations = useQuery(Location, locs => {
      return locs.filtered('kind == "user"');
    });

    const sortedLocations = useMemo(() => {
      return [...manualLocations]
        .map(location => ({
          location,
          distance: distanceBetweenLocations(currentPosition.coords, location.coords),
        }))
        .sort((a, b) => a.distance.mi - b.distance.mi);
    }, [manualLocations, currentPosition.coords]);

    useEffect(() => {
      event.on('map-location', onChangeMapLocation);
      return () => {
        event.removeListener('map-location', onChangeMapLocation);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChangeMapLocation = (_result: LocationPickerResult) => {
      // Selection visual removed; event still drives map positioning.
    };

    const selectLocation = (location: Location) => {
      const id = location._id.toString();
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
        index={initialIndex}
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
          <MapActionsView onPressAddLocation={onPressAddLocation} onPressClubs={onPressClubs ?? (() => {})} />
          <Divider />
          {/* Recent locations */}
          {recentLocations.length > 0 && (
            <>
              <Divider text={'RECENT EVENTS'} />
              {recentLocations.map(({ location, date }, index) => (
                <ListItem
                  key={location._id.toString()}
                  title={location.name}
                  subtitle={DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED)}
                  leftContent={<Clock color={theme.colors.listItemIcon} size={22} />}
                  rightContent={'chevron-right'}
                  position={listItemPosition(index, recentLocations.length)}
                  onPress={() => onPressRecentLocation?.(location._id.toString(), location.kind)}
                />
              ))}
            </>
          )}
          {/* Saved locations */}
          <Divider text={'SAVED LOCATIONS'} />
          {sortedLocations.length > 0 ? (
            sortedLocations.map(({ location, distance }, index) => {
              const currentLocation =
                location._id.toString() === currentLocationId;
              const distanceText = distance.mi < 0.1
                ? `${Math.round(distance.mi * 5280)} ft`
                : `${distance.mi.toFixed(1)} mi`;
              return (
                <ListItem
                  key={location._id.toString()}
                  title={location.name}
                  subtitle={currentLocation ? 'Current location' : null}
                  value={distanceText}
                  leftContent={
                    currentLocation ? (
                      <Navigation color={theme.colors.listItemIcon} size={22} fill={theme.colors.listItemIcon} />
                    ) : (
                      <LandPlot color={theme.colors.listItemIcon} />
                    )
                  }
                  rightContent={'chevron-right'}
                  position={listItemPosition(index, sortedLocations.length)}
                  onPress={() => selectLocation(location)}
                />
              );
            })
          ) : (
            <EmptyView
              info
              message={'No Locations'}
              details={'Tap Add Location or press on the map.'}
              positionTop
            />
          )}
          <Divider />
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
  handleIndicator: {
    backgroundColor: theme.colors.lightGray,
  },
  titleLeft: {
    alignSelf: 'flex-start',
  },
}));
