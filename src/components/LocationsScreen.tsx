import Animated, { SlideInUp } from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import { Location, SearchCriteria, SearchScope } from 'types/location';
import MapView, { Callout, CalloutSubview, MapMarker, MapType, Marker } from 'react-native-maps';
import { Pressable, Text, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createNewLocation, useLocation } from 'lib/location';

import ActionBar from 'components/atoms/ActionBar';
import Icon from 'react-native-vector-icons/FontAwesome6';
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
          onCalloutPress={() => console.log('hello1')}
          >
          <Animated.View entering={SlideInUp.duration(400)}>
            <Icon
              name={'map-pin'}
              color={'red'}
              size={30}
              style={{height: 30, top: -15}}
            />
          </Animated.View>
          {/* <Callout tooltip={true} >
              <CalloutSubview style={{
                position: 'absolute',
                flexDirection: 'row',
                alignItems:  'center',
                justifyContent: 'center',
                alignSelf: 'center',
                transform: [{ translateX: 18 }, {translateY: -61}],
                paddingHorizontal: 12,
                padding: 7,
                borderRadius: 10,
                backgroundColor: theme.colors.whiteTransparentDarker,
                }}
                // onPress={() => console.log('hello3')}
                >
                <View style={{
                  width: 0,
                  height: 0,
                  position:'absolute',
                  bottom: -12,
                  borderLeftWidth: 12,
                  borderRightWidth: 12,
                  borderBottomWidth: 12,
                  borderStyle: 'solid',
                  borderLeftColor: theme.colors.transparent,
                  borderRightColor: theme.colors.transparent,
                  borderBottomColor: theme.colors.whiteTransparentDarker,
                  backgroundColor: theme.colors.transparent,
                  transform: [{ rotate: "180deg" }],
                }} />
                <View style={{}}>
                  <Text style={{...theme.styles.textSmall, ...theme.styles.textBold}}>{location.name}</Text>
                  <Text style={{...theme.styles.textTiny}}>{location.description}</Text>
                </View>
                <Icon
                  name={'chevron-right'}
                  color={theme.colors.textDim}
                  size={16}
                  style={{paddingLeft: 12}}
                />
              </CalloutSubview>
          </Callout> */}
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

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  map: {
    width: '100%',
    height: '100%',
  },
}));

export default LocationsScreen;
