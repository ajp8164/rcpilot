import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect } from 'react';

import { Button } from '@rn-vui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Location } from 'realmdb';
import { LocationNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { selectLocation as _selectLocation } from 'store/selectors/locationSelectors';
import { useEvent } from 'lib/event';
import { useQuery } from '@realm/react';
import { useSelector } from 'react-redux';
import { useTheme } from 'theme';

export type LocationPickerResult = {
  locationId: string;
};

export type Props = NativeStackScreenProps<
  LocationNavigatorParamList,
  'Locations'
>;

const LocationsScreen = ({ navigation, route }: Props) => {
  const { eventName } = route.params;

  const theme = useTheme();
  const event = useEvent();

  const currentLocationId = useSelector(_selectLocation).locationId;
  const allLocations = useQuery(Location);

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={navigation.goBack}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderLocation: ListRenderItem<Location> = ({
    item: location,
    index,
  }) => {
    return (
      <ListItem
        key={location._id.toString()}
        title={location.name}
        rightImage={
          location._id.toString() === currentLocationId && (
            <Icon
              name={'location-dot'}
              solid={true}
              size={22}
              color={theme.colors.clearButtonText}
            />
          )
        }
        position={listItemPosition(index, allLocations.length)}
        onPress={() => selectLocation(location)}
      />
    );
  };

  const selectLocation = (location: Location) => {
    event.emit(eventName, {
      locationId: location._id.toString(),
    } as LocationPickerResult);
    navigation.goBack();
  };

  if (!allLocations.length) {
    return (
      <EmptyView
        info
        message={'No Locations'}
        details={'Create locations by dropping a pin on the map.'}
      />
    );
  }

  return (
    <FlatList
      style={theme.styles.view}
      data={allLocations}
      renderItem={renderLocation}
      keyExtractor={item => item._id.toString()}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        allLocations.length ? (
          <Divider note text={'Choose a location to view on the map.'} />
        ) : null
      }
      ListFooterComponent={<Divider style={{ height: theme.insets.bottom }} />}
    />
  );
};

export default LocationsScreen;
