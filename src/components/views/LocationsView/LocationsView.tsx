import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListItemCheckBox,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { useQuery } from '@realm/react';
import { EmptyView } from 'components/molecules/EmptyView';
import { Goal, LandPlot } from 'lucide-react-native';
import { Location } from 'realmdb';
import { selectLocation as _selectLocation } from 'store/selectors/locationSelectors';
import { LocationPickerResult } from 'types/location';

import { LocationsViewMethods, LocationsViewProps } from './types';

type LocationsView = LocationsViewMethods;

const LocationsView = React.forwardRef<LocationsView, LocationsViewProps>(
  (_props, _ref) => {
    const theme = useTheme();
    const event = useEvent();

    const currentLocationId = useSelector(_selectLocation).locationId;
    const allLocations = useQuery(Location);

    const [selectedLocation, setSelectedLocation] = useState(currentLocationId);

    useEffect(() => {
      event.on('map-location', onChangeMapLocation);
      return () => {
        event.removeListener('map-location', onChangeMapLocation);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChangeMapLocation = (result: LocationPickerResult) => {
      setSelectedLocation(result.locationId);
    };

    const selectLocation = (location: Location) => {
      const id = location._id.toString();
      setSelectedLocation(id);

      event.emit('select-map-location', {
        locationId: id,
      } as LocationPickerResult);
    };

    const renderLocation: ListRenderItem<Location> = ({
      item: location,
      index,
    }) => {
      const currentLocation = location._id.toString() === currentLocationId;
      return (
        <ListItemCheckBox
          key={location._id.toString()}
          title={location.name}
          subtitle={currentLocation ? 'Current location' : null}
          leftContent={
            <>
              {currentLocation ? (
                <Goal color={theme.colors.listItemIcon} />
              ) : (
                <LandPlot color={theme.colors.listItemIcon} />
              )}
            </>
          }
          position={listItemPosition(index, allLocations.length)}
          checked={location._id.toString() === selectedLocation}
          onChange={() => selectLocation(location)}
        />
      );
    };

    return (
      <FlatList
        data={allLocations}
        renderItem={renderLocation}
        keyExtractor={item => item._id.toString()}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<Divider />}
        ListEmptyComponent={
          <EmptyView
            info
            message={'No Locations'}
            details={'Tap button or press map to add a Location.'}
            positionTop
          />
        }
      />
    );
  },
);

export default LocationsView;
