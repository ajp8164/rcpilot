import Animated, { SlideInUp } from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import { Location, SearchCriteria, SearchScope } from 'types/location';
import MapView, { Callout, CalloutSubview, MapMarker, MapType, Marker } from 'react-native-maps';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { createNewLocation, useLocation } from 'lib/location';

import ActionBar from 'components/atoms/ActionBar';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { LocationNavigatorParamList } from 'types/navigation';
import { MapMarkerCallout } from 'components/molecules/MapMarkerCallout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';

// These are icon names.
enum RecenterButtonState {
  Initial = 'location-arrow',
  CurrentLocation = 'compass',
  CurrentLocationNorthUp = 'circle-up',
};

const initialSearchCriteria = { text: '', scope: SearchScope.FullText };

export type Props = NativeStackScreenProps<LocationNavigatorParamList, 'Locations'>;

const LocationsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const location = useLocation(/*locationId || location?.id*/);
  console.log('>>>>>>>', location);

  const mapViewRef = useRef<MapView>(null);  
  const markersRef = useRef<MapMarker[]>([]);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(
    initialSearchCriteria,
  );

  const [recenterButtonState, setRecenterButtonState] = useState(RecenterButtonState.Initial);

  useEffect(() => {
    setTimeout(() => {
      // Show the callout for only the last marker added.
      markersRef.current.forEach(marker =>  {
        marker.hideCallout();
      });
      markersRef.current[markersRef.current.length - 1]?.showCallout();
    }, 500); // Slight delay for ux.
  }, [locations]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        autoCapitalize: 'none',
        hideNavigationBar: true,
        onChangeText: event =>
          setSearchCriteria({
            text: event.nativeEvent.text,
            scope: SearchScope.FullText,
          }),
        onBlur: () => setSearchFocused(false),
        onCancelButtonPress: resetSearch,
        onFocus: () => setSearchFocused(true),
      },
    });
  }, [navigation]);

  const recenterMap = () => {
    if (location) {
      // Set button state and heading.
      let heading = undefined;

      switch (recenterButtonState) {
        case RecenterButtonState.Initial:
          setRecenterButtonState(RecenterButtonState.CurrentLocation);
          break;
        case RecenterButtonState.CurrentLocation:
          setRecenterButtonState(RecenterButtonState.CurrentLocationNorthUp);
          heading = 0;
          break;
        case RecenterButtonState.CurrentLocationNorthUp:
          setRecenterButtonState(RecenterButtonState.Initial);
          break;
      }

      const partialCamera = {
        center: {
          latitude: location.data.position.coords.latitude,
          longitude: location.data.position.coords.longitude,
        },
        heading: undefined,
        zoom: 100,
      };
      mapViewRef.current?.animateCamera(partialCamera);
    }
  };

  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  const addLocation = () => {
    const newLocation = createNewLocation(location.data.position);
    setLocations(locations.concat(newLocation));
  };

  const resetSearch = () => {
    setSearchFocused(false);
    setSearchCriteria(initialSearchCriteria);
  };

  const renderEventMarkers = (): JSX.Element[] => {
    return locations.map((location, index) => {
      return (
        <Marker
          ref={el => el ? markersRef.current[index] = el : null} 
          key={index}
          coordinate={location.position.coords}
          title={location.name}
          description={location.description}
          calloutOffset={{x: 0, y: -5}}
          calloutAnchor={{x: 0, y: 0}}>
          <Animated.View entering={SlideInUp.duration(400)}>
            <Icon
              name={'map-pin'}
              color={'red'}
              size={30}
              style={s.pin}
            />
          </Animated.View>
          <Callout
            alphaHitTest
            tooltip
            style={s.callout}>
            <MapMarkerCallout>
              <CalloutSubview
                onPress={() => navigation.navigate('LocationDetails', {
                  locationId: '1',
                })}
                style={s.calloutSubview}>
                <View style={s.calloutTextContainer}>
                  <Text numberOfLines={1} style={s.calloutText1}>{location.name}</Text>
                  <Text numberOfLines={1} style={s.calloutText2}>{location.description}</Text>
                </View>
                <Icon
                  name={'chevron-right'}
                  color={theme.colors.midGray}
                  size={16}
                />
              </CalloutSubview>
            </MapMarkerCallout>
          </Callout>
        </Marker>
      );      
    });
  };

  return (
    <View>
      {location && !location.loading &&
        <MapView
          ref={mapViewRef}
          style={s.map}
          showsUserLocation={true}
          mapType={mapType}
          initialRegion={{
            latitude: location.data.position.coords.latitude,
            longitude: location.data.position.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}>
          {renderEventMarkers()}
        </MapView>
      }
      <ActionBar
        actions={[
          {
            ActionComponent: (<Icon name={recenterButtonState} size={28} color={theme.colors.brandPrimary} />),
            onPress: recenterMap
          }, {
            ActionComponent: (<Icon name={'location-dot'} size={28} color={theme.colors.brandPrimary} />),
            onPress: addLocation
          }, {
            ActionComponent: (<Icon name={'satellite'} size={28} color={theme.colors.brandPrimary} />),
            onPress: toggleMapType
          }, {
            label: 'Done',
            onPress: navigation.goBack
          },
        ]}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  map: {
    width: '100%',
    height: '100%',
  },
  pin: {
    height: 30,
    top: -15
  },
  callout: {
    width: 180,
  },
  calloutSubview: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 5,    
  },
  calloutTextContainer: {
    paddingRight: 10,
  },
  calloutText1: {
    ...theme.styles.textSmall,
    ...theme.styles.textBold,
  },
  calloutText2: {
    ...theme.styles.textTiny,
  }
}));

export default LocationsScreen;
