import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { useLocationSummary } from 'lib/location';
import { ChevronRight, MapPin } from 'lucide-react-native';
import React, { forwardRef, useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import {
  Callout,
  MapMarker,
  Marker,
  MarkerDragStartEndEvent,
} from 'react-native-maps';
import Animated, { SlideInUp } from 'react-native-reanimated';
import { Location } from 'realmdb';

interface MapMarkerCalloutInterface {
  index: number;
  location: Location;
  onMarkerDragEnd: (event: MarkerDragStartEndEvent, location: Location) => void;
  onPressCallout: () => void;
}

export const MapMarkerCallout = forwardRef(
  (
    {
      index,
      location,
      onMarkerDragEnd,
      onPressCallout,
    }: MapMarkerCalloutInterface,
    ref: React.LegacyRef<MapMarker> | undefined,
  ) => {
    const theme = useTheme();
    const s = useStyles();
    const locationSummary = useLocationSummary(location);

    const [width, setWidth] = useState(0);
    const onLayout = (event: LayoutChangeEvent) => {
      setWidth(event.nativeEvent.layout.width);
    };

    return (
      <>
        {/* This text is not visible and is used to measure the location name width. */}
        <Text
          numberOfLines={1}
          style={[s.calloutText1, s.calloutText1Hidden]}
          onLayout={onLayout}>
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
            <MapPin color={'red'} fill={'white'} size={30} style={s.pin} />
          </Animated.View>
          <Callout style={[s.callout, { width }]} onPress={onPressCallout}>
            <View style={s.calloutTextContainer}>
              <Text numberOfLines={1} style={s.calloutText1}>
                {location.name}
              </Text>
              <Text numberOfLines={1} style={s.calloutText2}>
                {locationSummary}
              </Text>
            </View>
            <ChevronRight
              color={theme.colors.listItemIcon}
              style={{ right: 15 }}
            />
          </Callout>
        </Marker>
      </>
    );
  },
);

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  marker: {
    padding: 5,
  },
  callout: {
    height: 26,
    width: '100%',
    minWidth: 175,
    maxWidth: 250,
    marginVertical: -12,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calloutTextContainer: {
    width: '100%',
    paddingRight: 10,
  },
  calloutText1Hidden: {
    position: 'absolute',
    opacity: 0,
  },
  calloutText1: {
    ...theme.text.normal,
  },
  calloutText2: {
    ...theme.text.small,
    ...theme.styles.textDim,
  },
  pin: {
    height: 30,
    top: -14,
    left: -5,
  },
}));
