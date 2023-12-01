import { EventStyleEditorViewMethods, EventStyleEditorViewProps } from './types';

import { Divider } from '@react-native-ajp-elements/ui';
import { EventStyle } from 'types/event';
import {ListItemInput} from 'components/atoms/List';
import React from 'react';
import { View } from 'react-native';
import { useSetState } from '@react-native-ajp-elements/core';

type EventStyleEditorView = EventStyleEditorViewMethods;

const EventStyleEditorView = (props: EventStyleEditorViewProps) => {
  const { eventStyleId } = props;

  const mockEventStyle: EventStyle = {
    id: eventStyleId || '-1',
    name: '3D',
  };

  const [eventStyle, setEventStyle] = useSetState<EventStyle>(mockEventStyle);

  return (
    <View>
      <Divider />
      <ListItemInput
        value={mockEventStyle.name}
        placeholder={'Name for the style'}
        position={['first', 'last']}
        onChangeText={() => null}
      /> 
    </View>
  );
};

export default EventStyleEditorView;
