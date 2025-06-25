import { ListItem, ListItemInput } from 'components/atoms/List';
import {
  NewModelFuelNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { eqNumber, eqString, toNumber } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { CompositeScreenProps } from '@react-navigation/core';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { ModelFuel } from 'realmdb/ModelFuel';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { ScrollView } from 'react-native';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useTheme } from 'theme';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ModelFuelEditor'>,
  NativeStackScreenProps<NewModelFuelNavigatorParamList, 'NewModelFuel'>
>;

const ModelFuelEditorScreen = ({ navigation, route }: Props) => {
  const { modelFuelId } = route.params || {};
  const theme = useTheme();
  const event = useEvent();
  const setDebounced = useDebouncedRender();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const modelFuel = useObject(ModelFuel, new BSON.ObjectId(modelFuelId));

  const name = useRef(modelFuel?.name || undefined);
  const cost = useRef(modelFuel?.cost?.toFixed(2) || undefined);
  const [notes, setNotes] = useState(modelFuel?.notes || undefined);

  useEffect(() => {
    const canSave =
      !!name.current &&
      (!eqString(modelFuel?.name, name.current) ||
        !eqNumber(modelFuel?.cost, cost.current) ||
        !eqString(modelFuel?.notes, notes));

    const save = () => {
      if (modelFuel) {
        realm.write(() => {
          modelFuel.updatedOn = DateTime.now().toISO();
          modelFuel.name = name.current || 'no-name';
          modelFuel.cost = toNumber(cost.current);
          modelFuel.notes = notes;
        });
      } else {
        realm.write(() => {
          const now = DateTime.now().toISO();
          realm.create('ModelFuel', {
            createdOn: now,
            updatedOn: now,
            name: name.current,
            cost: toNumber(cost.current),
            notes,
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
  }, [name.current, cost.current, notes]);

  useEffect(() => {
    event.on('fuel-notes', onChangeNotes);
    return () => {
      event.removeListener('fuel-notes', onChangeNotes);
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
      <Divider text={'DETAILS'} />
      <ListItemInput
        value={name.current}
        placeholder={'Name for the fuel'}
        position={['first', 'last']}
        onChangeText={value => setDebounced(() => (name.current = value))}
      />
      <Divider />
      <ListItemInput
        title={'Fuel Cost'}
        label={'per gal'}
        value={cost.current}
        placeholder={'Amount'}
        numeric={true}
        keyboardType={'number-pad'}
        position={['first', 'last']}
        onChangeText={value => setDebounced(() => (cost.current = value))}
      />
      <Divider text={'NOTES'} />
      <ListItem
        title={notes || 'Notes'}
        position={['first', 'last']}
        onPress={() =>
          navigation.navigate('NotesEditor', {
            title: 'Fuel Notes',
            text: notes,
            eventName: 'fuel-notes',
          })
        }
      />
    </ScrollView>
  );
};

export default ModelFuelEditorScreen;
