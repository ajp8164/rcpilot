import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Text, View } from 'react-native';
import {
  Callout,
  MapMarker,
  Marker,
  MarkerDragStartEndEvent,
} from 'react-native-maps';
import Animated, { SlideInUp } from 'react-native-reanimated';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { useLocationSummary } from 'lib/location';
import { MapPin } from 'lucide-react-native';
import { Location } from 'realmdb';

interface MapMarkerCalloutInterface {
  index: number;
  location: Location;
  onMarkerDragEnd: (event: MarkerDragStartEndEvent, location: Location) => void;
  onPressCallout: () => void;
  onPressMarker: () => void;
}

export const MapMarkerCallout = forwardRef(
  (props: MapMarkerCalloutInterface, ref: React.Ref<MapMarker> | undefined) => {
    const { index, location, onMarkerDragEnd, onPressCallout, onPressMarker } =
      props;
    const theme = useTheme();
    const s = useStyles();
    const locationSummary = useLocationSummary(location);

    const internalRef = useRef<MapMarker>(null);

    // Expose internalRef to parent if they passed a ref.
    useImperativeHandle(ref, () => internalRef.current as MapMarker);

    return (
      <>
        <Marker
          ref={internalRef}
          key={index}
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          draggable
          onDragEnd={event => {
            onMarkerDragEnd(event, location);
          }}
          onPress={() => onPressMarker()}>
          <Animated.View entering={SlideInUp.duration(400)}>
            <MapPin
              color={theme.colors.assertive}
              fill={theme.colors.white}
              size={30}
            />
          </Animated.View>
          <Callout tooltip={false} style={s.callout} onPress={onPressCallout}>
            <View style={s.calloutContainer}>
              <View style={s.calloutContent}>
                <View style={s.calloutTextContainer}>
                  <Text numberOfLines={1} style={s.calloutText1}>
                    {location.name}
                  </Text>
                  <Text numberOfLines={1} style={s.calloutText2}>
                    {locationSummary}
                  </Text>
                </View>
              </View>
            </View>
          </Callout>
        </Marker>
      </>
    );
  },
);

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  callout: {
    minWidth: 180,
    maxWidth: 275,
  },
  calloutContainer: {
    alignItems: 'center',
    marginBottom: -8, // Moves the callout down toward the pin
    marginTop: -8, // Moves the callout down toward the pin
  },
  calloutContent: {
    backgroundColor: theme.colors.stickyWhite,
  },
  calloutTextContainer: {
    alignItems: 'center',
  },
  calloutText1: {
    ...theme.text.normal,
    color: theme.colors.stickyText,
  },
  calloutText2: {
    ...theme.text.tiny,
    color: theme.colors.stickyText,
  },
}));
