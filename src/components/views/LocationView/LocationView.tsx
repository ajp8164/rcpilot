import React, { useEffect, useImperativeHandle, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { ListItemInput, ListItemNotes } from 'components/atoms/List';
import formatcoords from 'formatcoords';
import { useLocationSummary } from 'lib/location';
import { useConfirmAction } from 'lib/useConfirmAction';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Location } from 'realmdb';
import { selectLocation } from 'store/selectors/locationSelectors';
import { saveCurrentLocation } from 'store/slices/location';
import { FilterType } from 'types/filter';
import { SetupNavigatorParamList } from 'types/navigation';
import { NotesEditorResult } from 'types/notes';

import { LocationViewMethods, LocationViewProps } from './types';

type LocationView = LocationViewMethods;

const LocationView = React.forwardRef<LocationView, LocationViewProps>(
  (props, ref) => {
    const {
      locationId,
      onBlurName,
      onFocusName,
      onPressNotes,
      titleRightContent,
    } = props;

    const theme = useTheme();
    const s = useStyles();
    const confirmAction = useConfirmAction();
    const event = useEvent();
    const dispatch = useDispatch();
    const realm = useRealm();

    const navigation: NavigationProp<SetupNavigatorParamList> = useNavigation();

    const _location = realm.objectForPrimaryKey(
      'Location',
      new BSON.ObjectId(locationId),
    ) as Location;

    const [location, setLocation] = useState<Location>(_location);
    const currentLocationId = useSelector(selectLocation).locationId;

    const locationSummary = useLocationSummary(location);

    const coords =
      location &&
      formatcoords(location?.coords.latitude, location?.coords.longitude)
        .format({
          latLonSeparator: '|',
        })
        .split('|');

    useEffect(() => {
      refreshLocation();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationId]);

    useEffect(() => {
      event.on('location-notes', onChangeNotes);
      return () => {
        event.removeListener('location-notes', onChangeNotes);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    const refreshLocation = () => {
      const location = realm.objectForPrimaryKey(
        'Location',
        new BSON.ObjectId(locationId),
      ) as Location;

      if (location) {
        setLocation(location);
      }
    };

    const onChangeName = (text: string) => {
      if (location) {
        realm.write(() => {
          location.updatedOn = DateTime.now().toISO();
          location.name = text;
        });
        refreshLocation();
      }
    };

    const onChangeNotes = (result: NotesEditorResult) => {
      if (location) {
        realm.write(() => {
          location.updatedOn = DateTime.now().toISO();
          location.notes = result.text;
        });
        refreshLocation();
      }
    };

    const deleteLocation = () => {
      // If deleting the current location object then clear the current location.
      // Delete this before the location object to prevent referencing a deleted object.
      if (location?._id.toString() === currentLocationId) {
        dispatch(saveCurrentLocation({}));
      }

      realm.write(() => {
        realm.delete(location);
      });
    };

    useImperativeHandle(ref, () => ({
      //  These functions exposed to the parent component through the ref.
    }));

    return (
      <>
        <ScrollView
          style={theme.styles.view}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}>
          {location ? (
            <>
              <ListItemInput
                position={['first', 'last']}
                containerStyle={{
                  backgroundColor: theme.colors.viewBackground,
                }}
                rightContent={titleRightContent}
                inputProps={{
                  inputStyle: s.title,
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: onChangeName,
                  onFocus: () => onFocusName(),
                  onBlur: () => onBlurName(),
                  value: location.name,
                  placeholder: 'Location Name',
                  autoCapitalize: 'words',
                }}
              />
              <ListItem
                title={'Last Event'}
                position={['first']}
                value={locationSummary.date}
              />
              <ListItem
                title={'Events'}
                value={`${locationSummary.count}`}
                position={['last']}
                rightContent={'chevron-right'}
                onPress={() =>
                  navigation.navigate('Events', {
                    filterType: FilterType.EventsModelFilter,
                    locationId,
                    readOnly: true,
                  })
                }
              />
              <Divider />
              <ListItemNotes
                notes={location.notes}
                position={['first', 'last']}
                onPress={() => onPressNotes(location.notes, location.name)}
              />
              <Divider text={'COORDINATES'} />
              <ListItem
                title={'Latitude'}
                position={['first']}
                value={coords ? coords[0] : ''}
              />
              <ListItem
                title={'Longitude'}
                position={['last']}
                value={coords ? coords[1] : ''}
              />
              <Divider />
              <Button
                title={'Delete Location'}
                titleStyle={theme.styles.buttonOutlineAssertiveTitle}
                buttonStyle={theme.styles.buttonOutlineAssertive}
                containerStyle={theme.styles.buttonContainer}
                outline
                onPress={() => {
                  confirmAction(
                    {
                      label: 'Delete Location',
                      title:
                        'This action cannot be undone.\nAre you sure you want to delete this location?',
                    },
                    deleteLocation,
                  );
                }}
              />
              <Divider />
            </>
          ) : (
            <View>
              <Divider
                note
                text={'Location not found!'}
                subHeaderStyle={s.title}
                rightComponent={titleRightContent}
              />
              <Text style={s.message}>{'No location was found.'}</Text>
            </View>
          )}
        </ScrollView>
      </>
    );
  },
);

const useStyles = ThemeManager.createStyleSheet(({ theme, device }) => ({
  message: {
    ...theme.text.normal,
    marginBottom: device.insets.bottom,
  },
  title: {
    ...theme.text.h4,
    fontWeight: '700',
    paddingTop: 10,
    marginHorizontal: 0,
  },
}));

export default LocationView;
