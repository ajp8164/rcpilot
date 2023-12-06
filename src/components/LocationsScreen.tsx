import { Alert, Text, View } from 'react-native';
import Animated, { SlideInUp } from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import { Location, SearchCriteria, SearchScope } from 'types/location';
import MapView, { Callout, CalloutSubview, MapMarker, MapType, Marker } from 'react-native-maps';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createNewLocation, useLocation } from 'lib/location';

import ActionBar from 'components/atoms/ActionBar';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { MapMarkerCallout } from 'components/molecules/MapMarkerCallout';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

const initialSearchCriteria = { text: '', scope: SearchScope.FullText };

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Locations'>;

const LocationsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const location = useLocation(/*locationId || location?.id*/);
  console.log('>>>>>>>', location);

  const [mapType, setMapType] = useState<MapType>('standard');
  const [locations, setLocations] = useState<Location[]>([]);
  const markersRef = useRef<MapMarker[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(
    initialSearchCriteria,
  );

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
                onPress={_ => {Alert.alert('callout pressed')}}
                style={s.calloutSubview}>
                <View style={s.calloutTextContainer}>
                  <Text numberOfLines={1} style={s.calloutText1}>{location.name}</Text>
                  <Text numberOfLines={1} style={s.calloutText2}>{location.description}</Text>
                </View>
                <Icon
                  name={'chevron-right'}
                  color={theme.colors.textDim}
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
            ActionComponent: (<Icon name={'location-arrow'} size={28} color={theme.colors.brandPrimary} />),
            onPress: () => null
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
    width: 150,
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
