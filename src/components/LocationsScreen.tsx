import { AppTheme, useTheme } from 'theme';
import { Location, SearchCriteria, SearchScope } from 'types/location';
import MapView, { MapType, Marker } from 'react-native-maps';
import React, { useLayoutEffect, useState } from 'react';
import { createNewLocation, useLocation } from 'lib/location';

import ActionBar from 'components/atoms/ActionBar';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { View } from 'react-native';
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(
    initialSearchCriteria,
  );

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
          key={index}
          coordinate={location.position.coords}
          title={location.name}
          description={location.description}
          isPreselected={true}
        />
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
