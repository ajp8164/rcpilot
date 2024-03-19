import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
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
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

export type Props = NativeStackScreenProps<LocationNavigatorParamList, 'LocationEditor'>;

const LocationEditorScreen = ({ navigation, route }: Props) => {
  const { locationId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const realm = useRealm();

  const location = useObject(Location, new BSON.ObjectId(locationId));

  const coords =
    location &&
    formatcoords(location?.coords.latitude, location?.coords.longitude)
      .format({
        latLonSeparator: '|',
      })
      .split('|');

  const [name, setName] = useState(location?.name || undefined);
  const [notes, setNotes] = useState(location?.notes);

  useEffect(() => {
    if (!locationId || !location) return;

    const canSave =
      !!name && (!eqString(location?.name, name) || !eqString(location?.notes, notes));

    if (canSave) {
      realm.write(() => {
        location.updatedOn = DateTime.now().toISO();
        location.name = name || 'no-name';
        location.notes = notes;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, notes]);

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

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'INFORMATION'} />
      <ListItemInput
        value={name}
        placeholder={'Location Name'}
        position={['first', 'last']}
        onChangeText={setName}
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
        onPress={() => null}
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
