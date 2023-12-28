import { EventStyleEditorViewMethods, EventStyleEditorViewProps } from './types';
import React, { useImperativeHandle, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Divider } from '@react-native-ajp-elements/ui';
import { EventStyle } from 'realmdb/EventStyle';
import {ListItemInput} from 'components/atoms/List';
import { View } from 'react-native';
import { useEditorOnChange } from 'lib/useEditorOnChange';

type EventStyleEditorView = EventStyleEditorViewMethods;

const EventStyleEditorView = React.forwardRef<EventStyleEditorView, EventStyleEditorViewProps>(
  (props, ref) => {
  const { eventStyleId, onChange } = props;

  const realm = useRealm();
  const eventStyle = eventStyleId ? useObject(EventStyle, new BSON.ObjectId(eventStyleId)) : null;
  const [name, setName] = useState(eventStyle?.name || '');

  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
    save,
  }));

  useEditorOnChange(onChange, name.length > 0 && name !== eventStyle?.name);

  const save = () => {
    if (eventStyle) {
      realm.write(() => {
        eventStyle.name = name;
      });
    } else {
      realm.write(() => {
        realm.create('EventStyle', {
          name
        });
      });
    }
  };

  return (
    <View>
      <Divider />
      <ListItemInput
        value={name}
        placeholder={'Name for the style'}
        position={['first', 'last']}
        onChangeText={setName}
      /> 
    </View>
  );
});

export default EventStyleEditorView;
