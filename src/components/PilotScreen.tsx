import { AppTheme, useTheme } from 'theme';
import { Keyboard, ScrollView } from 'react-native';
import { ListItem, ListItemInput } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { Model } from 'realmdb/Model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { eqString } from 'realmdb/helpers';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Pilot'>;

const PilotScreen = ({ navigation, route }: Props) => {
  const { pilotId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();
  const pilot = useObject(Pilot, new BSON.ObjectId(pilotId));
  const favoriteModels = [] as Model[];

  const [name, setName] = useState(pilot?.name || undefined);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const canSave = name && (
      !eqString(pilot?.name, name)
    );

    const save = () => {
      if (pilot) {
        realm.write(() => {
          pilot.name = name!;
        });
      }
    };
  
    const onDone = () => {
      save();
      Keyboard.dismiss();
      setIsEditing(false);
    };

    navigation.setOptions({
      title: pilot?.name,
      headerLeft: () => {
        if (isEditing) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
              onPress={() => {
                Keyboard.dismiss();
                setIsEditing(false);
              }}
            />
          )
        }
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
  }, [isEditing, name]);

  return (
    <SafeAreaView edges={['left', 'right']} style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={"PILOT'S NAME"}/>
        <ListItemInput
          value={name}
          placeholder={'Pilot Name'}
          position={['first', 'last']}
          onChangeText={setName}
          onBlur={() => setIsEditing(false)}
          onFocus={() => setIsEditing(true)}
        /> 
        <Divider text={'MODEL USAGE'}/>
        <ListItem
          title={'Blade 150S'}
          value={'0:04, 1 event'}
          position={['first', 'last']}
          onPress={() => navigation.navigate('Flights', {
            pilotId: '123456789012',
          })}
        />
        <Divider type={'note'} text={'Total duration (H:MM) and number of events of each style for events piloted by Andy.'}/>
        <Divider text={'EVENT STYLES'}/>
        <ListItem
          title={'Sport'}
          value={'0:04, 1 event'}
          position={['first', 'last']}
          onPress={() => null}
        />
        <Divider type={'note'} text={'Total duration (H:MM) and number of events of each style for events piloted by Andy.'}/>
        {favoriteModels.length > 0 && <Divider text={'FAVORITE MODELS'}/>}
        {favoriteModels.map((model, index) => {
          return (
            <ListItem
              title={model.name}
              subtitle={`${model.type} with ${model.totalEvents} flights, ${model.totalTime} total time`}
              position={favoriteModels.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === favoriteModels.length - 1 ? ['last'] : []}
            />
          )
        })}
        <Divider text={'MANAGING FAVORITE MODELS'}/>
        <ListItem
          title={'Select Favorite Models...'}
          titleStyle={s.favorite}
          position={['first', 'last']}
          rightImage={false}
          onPress={() => null}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
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
  favorite: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton
  },
}));

export default PilotScreen;
