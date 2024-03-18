import React, { useEffect, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Divider } from '@react-native-ajp-elements/ui';
import { EventStyle } from 'realmdb/EventStyle';
import { ListItemInput } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { eqString } from 'realmdb/helpers';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useTheme } from 'theme';

// CompositeScreenProps not working here since NewEventStyle is also in the SetupNavigator
// just using a different presentation (didn't create a new navigator for a single screen).
export type Props =
  | NativeStackScreenProps<SetupNavigatorParamList, 'EventStyleEditor'>
  | NativeStackScreenProps<SetupNavigatorParamList, 'NewEventStyle'>;

const EventStyleEditorScreen = ({ navigation, route }: Props) => {
  const { eventStyleId } = route.params || {};
  const theme = useTheme();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const eventStyle = useObject(EventStyle, new BSON.ObjectId(eventStyleId));

  const [name, setName] = useState(eventStyle?.name || undefined);

  useEffect(() => {
    const canSave = !!name && !eqString(eventStyle?.name, name);

    const save = () => {
      if (eventStyle) {
        realm.write(() => {
          eventStyle.name = name || 'no-name';
        });
      } else {
        realm.write(() => {
          realm.create('EventStyle', {
            name,
          });
        });
      }
    };

    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({ enabled: canSave, action: onDone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItemInput
        value={name}
        placeholder={'Name for the style'}
        position={['first', 'last']}
        onChangeText={setName}
      />
    </ScrollView>
  );
};

export default EventStyleEditorScreen;
