import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useQuery, useRealm } from '@realm/react';
import { ListItemInput, ListItemNotes } from 'components/atoms/List';
import { ClubView } from 'components/views/ClubView';
import LocationActionsView, {
  LocationActionsViewMethods,
} from 'components/views/LocationActionsView';
import formatcoords from 'formatcoords';
import { useLocationSummary } from 'lib/location';
import { useConfirmAction } from 'lib/useConfirmAction';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Club, Location } from 'realmdb';
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
      presentWithEditor = false,
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

    const club = useQuery(Club).filtered(
      'location._id == $0',
      new BSON.ObjectId(locationId),
    )?.[0];

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

    const [showEditor, setShowEditor] = useState(presentWithEditor);

    const locationActionsViewRef = useRef<LocationActionsViewMethods>(null);

    useImperativeHandle(ref, () => ({
      // These functions exposed to the parent component through the ref.
      setEditMode,
    }));

    const setEditMode = (value: boolean) => {
      setShowEditor(value);
    };

    useEffect(() => {
      setShowEditor(presentWithEditor);
    }, [presentWithEditor]);

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

    const renderLocationView = () => {
      return (
        <>
          {club ? (
            <ClubView clubId={club._id.toString()} hideName={true} />
          ) : null}
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
          <ListItem
            title={'Coordinates'}
            position={['first', 'last']}
            subtitle={coords ? `${coords[0]}, ${coords[1]}` : ''}
          />
          <Divider text={'NOTES'} />
          <ListItemNotes
            notes={location.notes}
            position={['first', 'last']}
            onPress={() => onPressNotes(location.notes, 'Notes')}
          />
        </>
      );
    };

    const renderEditView = () => {
      return (
        <View>
          <Divider />
          <ListItemInput
            position={['first', 'last']}
            inputProps={{
              label: 'Name',
              inputAccessoryViewID: 'keyboardAccessory',
              onChangeText: onChangeName,
              onFocus: () => onFocusName(),
              onBlur: () => onBlurName(),
              value: location.name,
              placeholder: 'Location Name',
              autoCapitalize: 'words',
            }}
          />
        </View>
      );
    };

    return (
      <View style={theme.styles.view}>
        {location ? (
          <>
            {!club ? (
              <LocationActionsView
                ref={locationActionsViewRef}
                mode={showEditor ? 'edit' : 'default'}
                showDelete={!club}
                style={{ marginVertical: 10 }}
                onPressDelete={() => {
                  confirmAction(
                    {
                      label: 'Delete Location',
                      title:
                        'This action cannot be undone.\nAre you sure you want to delete this location?',
                    },
                    deleteLocation,
                  );
                }}
                onPressEdit={() => setShowEditor(true)}
                onPressDone={() => setShowEditor(false)}
              />
            ) : null}
            {showEditor ? renderEditView() : renderLocationView()}
            <Divider />
          </>
        ) : (
          <View>
            <Divider
              note
              text={'Location not found!'}
              subHeaderStyle={s.title}
            />
            <Text style={s.message}>{'No location was found.'}</Text>
          </View>
        )}
      </View>
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
