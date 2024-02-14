import { ListItem, ListItemInput } from 'components/atoms/List';
import { NewModelFuelNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import React, { useEffect, useState } from 'react';
import { eqNumber, eqString, toNumber } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { CompositeScreenProps } from '@react-navigation/core';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { ModelFuel } from 'realmdb/ModelFuel';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
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
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const modelFuel = useObject(ModelFuel, new BSON.ObjectId(modelFuelId));
  
  const [name, setName] = useState(modelFuel?.name || undefined);
  const [cost, setCost] = useState(modelFuel?.cost?.toFixed(2) || undefined);
  const [notes, setNotes] = useState(modelFuel?.notes || undefined);

  useEffect(() => {
    const canSave = !!name && (
      !eqString(modelFuel?.name, name) ||
      !eqNumber(modelFuel?.cost, cost) ||
      !eqString(modelFuel?.notes, notes)
    );

    const save = () => {
      if (modelFuel) {
        realm.write(() => {
          modelFuel.updatedOn = DateTime.now().toISO()!,
          modelFuel.name = name!;
          modelFuel.cost = toNumber(cost);
          modelFuel.notes = notes;
        });
      } else {
        realm.write(() => {
          const now = DateTime.now().toISO()!;
          realm.create('ModelFuel', {
            createdOn: now,
            updatedOn: now,
            name,
            cost: toNumber(cost),
            notes,
          });
        });
      }
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({visible: canSave, action: onDone});
  }, [name, cost, notes]);

  useEffect(() => {
    event.on('fuel-notes', setNotes);
    return () => {
      event.removeListener('fuel-notes', setNotes);
    };
  }, []);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'DETAILS'} />
        <ListItemInput
          value={name}
          placeholder={'Name for the fuel'}
          position={['first', 'last']}
          onChangeText={setName}
        /> 
        <Divider />
        <ListItemInput
          title={'Fuel Cost'}
          label={'per gal'}
          value={cost}
          placeholder={'Amount'}
          numeric={true}
          keyboardType={'number-pad'}
          position={['first', 'last']}
          onChangeText={setCost}
        />
        <Divider text={'NOTES'} />
        <ListItem
          title={notes || 'Notes'}
          position={['first', 'last']}
          onPress={() => navigation.navigate('Notes', {
            title: 'Fuel Notes',
            text: notes,
            eventName: 'fuel-notes',
          })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModelFuelEditorScreen;
