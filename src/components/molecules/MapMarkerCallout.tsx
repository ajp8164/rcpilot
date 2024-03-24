import Animated, { SlideInUp } from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import {
  Callout,
  CalloutSubview,
  MapMarker,
  Marker,
  MarkerDragStartEndEvent,
} from 'react-native-maps';
import { LayoutChangeEvent, Text, View } from 'react-native';
import React, { forwardRef, useState } from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { Location } from 'realmdb';
import { makeStyles } from '@rneui/themed';
import { useLocationSummary } from 'lib/location';

interface MapMarkerCalloutInterface {
  index: number;
  location: Location;
  onMarkerDragEnd: (event: MarkerDragStartEndEvent, location: Location) => void;
  onPressCallout: () => void;
}

export const MapMarkerCallout = forwardRef(
  (
    { index, location, onMarkerDragEnd, onPressCallout }: MapMarkerCalloutInterface,
    ref: React.LegacyRef<MapMarker> | undefined,
  ) => {
    const theme = useTheme();
    const s = useStyles(theme);
    const locationSummary = useLocationSummary(location);

    const [width, setWidth] = useState(0);
    const onLayout = (event: LayoutChangeEvent) => {
      setWidth(event.nativeEvent.layout.width);
    };

    return (
      <>
        {/* This text is used to measure the location name width. */}
        <Text numberOfLines={1} style={[s.calloutText1, s.calloutText1Hidden]} onLayout={onLayout}>
          {location.name}
        </Text>
        <Marker
          ref={ref}
          key={index}
          identifier={location._id.toString()}
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          style={s.marker}
          calloutOffset={{ x: 0, y: -7 }}
          calloutAnchor={{ x: 0, y: 10 }}
          draggable
          onDragEnd={event => onMarkerDragEnd(event, location)}>
          <Animated.View entering={SlideInUp.duration(400)}>
            <Icon name={'map-pin'} color={'red'} size={30} style={s.pin} />
          </Animated.View>
          <Callout style={s.callout}>
            <CalloutSubview style={[s.calloutSubview, { width }]} onPress={onPressCallout}>
              <View style={s.calloutTextContainer}>
                <Text numberOfLines={1} style={s.calloutText1}>
                  {location.name}
                </Text>
                <Text numberOfLines={1} style={s.calloutText2}>
                  {locationSummary}
                </Text>
              </View>
              <Icon name={'chevron-right'} color={theme.colors.midGray} size={16} />
            </CalloutSubview>
          </Callout>
        </Marker>
      </>
    );
  },
);

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  marker: {
    padding: 5,
  },
  callout: {
    height: 24,
  },
  calloutSubview: {
    width: '100%',
    height: 48,
    minWidth: 150,
    maxWidth: 250,
    marginVertical: -12,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calloutTextContainer: {
    width: '100%',
  },
  calloutText1Hidden: {
    position: 'absolute',
    opacity: 0,
  },
  calloutText1: {
    ...theme.styles.textNormal,
    paddingRight: 10,
  },
  calloutText2: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim,
  },
  pin: {
    height: 30,
    top: -15,
  },
}));
