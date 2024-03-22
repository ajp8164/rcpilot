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
import { locationSummary } from 'lib/location';
import { makeStyles } from '@rneui/themed';

interface MapMarkerCalloutInterface {
  index: number;
  location: Location;
  onMarkerDragEnd: (event: MarkerDragStartEndEvent, location: Location) => void;
  onPress: () => void;
}

export const MapMarkerCallout = forwardRef(
  (
    { index, location, onMarkerDragEnd, onPress }: MapMarkerCalloutInterface,
    ref: React.LegacyRef<MapMarker> | undefined,
  ) => {
    const theme = useTheme();
    const s = useStyles(theme);

    const [width, setWidth] = useState(0);

    const onLayout = (event: LayoutChangeEvent) => {
      setWidth(event.nativeEvent.layout.width);
    };

    return (
      <>
        <View>
          <Text
            numberOfLines={1}
            style={[s.calloutText1, s.calloutText1Hidden]}
            onLayout={onLayout}>
            {location.name}
          </Text>
        </View>
        <Marker
          ref={ref}
          key={index}
          identifier={location._id.toString()}
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title={location.name}
          calloutOffset={{ x: 0, y: -5 }}
          calloutAnchor={{ x: 0, y: 0 }}
          draggable
          onDragEnd={event => onMarkerDragEnd(event, location)}>
          <Animated.View entering={SlideInUp.duration(400)}>
            <Icon name={'map-pin'} color={'red'} size={30} style={s.pin} />
          </Animated.View>
          <Callout alphaHitTest tooltip>
            <View style={[s.bubble, { width: width + 46 }]}>
              <CalloutSubview style={s.calloutSubview} onPress={onPress}>
                <View style={s.calloutTextContainer}>
                  <Text numberOfLines={1} style={s.calloutText1}>
                    {location.name}
                  </Text>
                  <Text numberOfLines={1} style={s.calloutText2}>
                    {locationSummary(location)}
                  </Text>
                </View>
                <Icon name={'chevron-right'} color={theme.colors.midGray} size={16} />
              </CalloutSubview>
            </View>
            <View style={s.arrow} />
          </Callout>
        </Marker>
      </>
    );
  },
);

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  bubble: {
    backgroundColor: theme.colors.whiteTransparentDarker,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
    minWidth: 150,
    maxWidth: 300,
  },
  arrow: {
    width: 0,
    height: 0,
    alignSelf: 'center',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderStyle: 'solid',
    borderLeftColor: theme.colors.transparent,
    borderRightColor: theme.colors.transparent,
    borderBottomColor: theme.colors.whiteTransparentDarker,
    backgroundColor: theme.colors.transparent,
    transform: [{ rotate: '180deg' }],
  },
  calloutSubview: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 3,
  },
  calloutTextContainer: {
    paddingRight: 10,
  },
  calloutText1: {
    ...theme.styles.textSmall,
    ...theme.styles.textBold,
  },
  calloutText1Hidden: {
    position: 'absolute',
    opacity: 0,
  },
  calloutText2: {
    ...theme.styles.textTiny,
  },
  pin: {
    height: 30,
    top: -15,
  },
}));
