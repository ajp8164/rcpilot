import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { Location } from 'realmdb';
import { LocationNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@realm/react';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<LocationNavigatorParamList, 'Locations'>;

const LocationsScreen = ({ navigation }: Props) => {
  const theme = useTheme();

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

  const renderLocation: ListRenderItem<Location> = ({ item: location, index }) => {
    return (
      <ListItem
        key={location._id.toString()}
        title={location.name}
        position={listItemPosition(index, allLocations.length)}
        rightImage={false}
        // onPress={() =>
        //   navigation.navigate('EventStyleEditor', {
        //     eventStyleId: style._id.toString(),
        //   })
        // }
      />
    );
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
        allLocations.length ? <Divider note text={'Choose a location to view on the map.'} /> : null
      }
      ListFooterComponent={<Divider style={{ height: theme.insets.bottom }} />}
    />
  );
};

export default LocationsScreen;
