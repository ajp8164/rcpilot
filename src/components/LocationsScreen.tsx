import { Divider, ListItem, listItemPosition } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { useEvent } from 'lib/event';
import { MapPin } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { useSelector } from 'react-redux';
import { Location } from 'realmdb';
import { selectLocation as _selectLocation } from 'store/selectors/locationSelectors';
import { useTheme } from 'theme';
import { LocationNavigatorParamList } from 'types/navigation';

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
        rightContent={
          <>
            {location._id.toString() === currentLocationId ? (
              <MapPin color={theme.colors.listItemIcon} />
            ) : null}
          </>
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
        details={'Create a location by dropping a pin on the map.'}
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
