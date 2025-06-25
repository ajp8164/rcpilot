import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput } from 'components/atoms/List';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { FilterType } from 'types/filter';
import { Location } from 'realmdb';
import { LocationNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { ScrollView } from 'react-native';
import { eqString } from 'realmdb/helpers';
import formatcoords from 'formatcoords';
import { makeStyles } from '@rn-vui/themed';
import { saveCurrentLocation } from 'store/slices/location';
import { selectLocation } from 'store/selectors/locationSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useEvent } from 'lib/event';

export type Props = NativeStackScreenProps<
  LocationNavigatorParamList,
  'LocationEditor'
>;

const LocationEditorScreen = ({ navigation, route }: Props) => {
  const { locationId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const confirmAction = useConfirmAction();
  const setDebounced = useDebouncedRender();
  const event = useEvent();
  const dispatch = useDispatch();
  const realm = useRealm();

  const location = useObject(Location, new BSON.ObjectId(locationId));
  const currentLocationId = useSelector(selectLocation).locationId;

  const coords =
    location &&
    formatcoords(location?.coords.latitude, location?.coords.longitude)
      .format({
        latLonSeparator: '|',
      })
      .split('|');

  const name = useRef(location?.name || undefined);
  const [notes, setNotes] = useState(location?.notes || undefined);

  useEffect(() => {
    if (!locationId || !location) return;

    const canSave =
      !!name &&
      (!eqString(location?.name, name.current) ||
        !eqString(location?.notes, notes));

    if (canSave) {
      realm.write(() => {
        location.updatedOn = DateTime.now().toISO();
        location.name = name.current || 'no-name';
        location.notes = notes;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name.current, notes]);

  useEffect(() => {
    event.on('location-notes', onChangeNotes);
    return () => {
      event.removeListener('location-notes', onChangeNotes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeNotes = (result: NotesEditorResult) => {
    setNotes(result.text);
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
    navigation.goBack();
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'INFORMATION'} />
      <ListItemInput
        value={name.current}
        placeholder={'Location Name'}
        position={['first', 'last']}
        onChangeText={value => setDebounced(() => (name.current = value))}
      />
      <Divider />
      <ListItem
        title={notes || 'Notes'}
        position={['first', 'last']}
        onPress={() =>
          navigation.navigate('NotesEditor', {
            title: 'Action Notes',
            text: notes,
            eventName: 'checklist-action-notes',
          })
        }
      />
      <Divider text={'COORDINATES'} />
      <ListItem
        title={'Latitude'}
        position={['first']}
        value={coords ? coords[0] : ''}
        rightImage={false}
      />
      <ListItem
        title={'Longitude'}
        position={['last']}
        value={coords ? coords[1] : ''}
        rightImage={false}
      />
      <Divider text={'EVENTS'} />
      <ListItem
        title={'Last On'}
        position={['first']}
        value={'Nov 4, 2023 at 11:49PM'}
        rightImage={false}
      />
      <ListItem
        title={'Details'}
        position={['last']}
        onPress={() =>
          navigation.navigate('Events', {
            filterType: FilterType.BypassFilter,
            locationId: location?._id.toString(),
          })
        }
      />
      <Divider text={'DANGER ZONE'} />
      <ListItem
        title={'Delete Location'}
        titleStyle={s.delete}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => {
          confirmAction(deleteLocation, {
            label: 'Delete Location',
            title:
              'This action cannot be undone.\nAre you sure you want to delete this location?',
          });
        }}
      />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  delete: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.assertive,
  },
}));

export default LocationEditorScreen;
