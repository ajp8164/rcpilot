import { AppTheme, useTheme } from 'theme';
import React, { useEffect, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { EventStyle } from 'realmdb/EventStyle';
import { ListItemInput } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props =
  NativeStackScreenProps<SetupNavigatorParamList, 'EventStyleEditor'> |
  NativeStackScreenProps<SetupNavigatorParamList, 'NewEventStyle'>;

const EventStyleEditorScreen = ({ navigation, route }: Props) => {
  const { eventStyleId } = route.params || {};
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();
  const eventStyle = eventStyleId ? useObject(EventStyle, new BSON.ObjectId(eventStyleId)) : null;
  const [name, setName] = useState(eventStyle?.name || '');

  useEffect(() => {
    const canSave = name.length > 0 && name !== eventStyle?.name;

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
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
            onPress={navigation.goBack}
          />
        )
      },
      headerRight: () => {
        if (canSave) {
          return (
            <Button
              title={'Done'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.doneButton]}
              onPress={onDone}
            />
          )
        }
      },
    });
  }, [name]);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      <ListItemInput
        value={name}
        placeholder={'Name for the style'}
        position={['first', 'last']}
        onChangeText={setName}
      /> 
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default EventStyleEditorScreen;