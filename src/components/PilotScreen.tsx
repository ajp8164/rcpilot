import { AppTheme, useTheme } from 'theme';
import { Keyboard, Platform, View } from 'react-native';
import { ListItem, ListItemInput } from 'components/atoms/List';
import { NestableDraggableFlatList, NestableScrollContainer, RenderItemParams } from 'react-native-draggable-flatlist';
import React, { useEffect, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { Divider, getColoredSvg } from '@react-native-ajp-elements/ui';
import { Model } from 'realmdb/Model';
import { ModelPickerResult } from 'components/ModelPickerScreen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { eqString } from 'realmdb/helpers';
import { makeStyles } from '@rneui/themed';
import { modelTypeIcons } from 'lib/model';
import { useEvent } from 'lib/event';
import { SvgXml } from 'react-native-svg';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Pilot'>;

const PilotScreen = ({ navigation, route }: Props) => {
  const { pilotId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const realm = useRealm();
  const pilot = useObject(Pilot, new BSON.ObjectId(pilotId));

  const [name, setName] = useState(pilot?.name || undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [listEditModeEnabled, setListEditModeEnabled] = useState(false);

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

    const onEdit = () => {
      setListEditModeEnabled(!listEditModeEnabled);
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
        } else if (pilot?.favoriteModels && pilot.favoriteModels.length > 1) {
          return (
            <Button
            title={listEditModeEnabled ? 'Done' : 'Edit'}
            titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.doneButton]}
              onPress={onEdit}
            />
          )
        }
      },
    });
  }, [ isEditing, listEditModeEnabled, name, pilot?.favoriteModels ]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('pilot-favorite-models', onChangeFavoriteModels);

    return () => {
      event.removeListener('pilot-favorite-models', onChangeFavoriteModels);
    };
  }, []);

  const onChangeFavoriteModels = (result: ModelPickerResult) => {
    realm.write(() => {
      pilot!.favoriteModels = result.models;
    });
  };

  const forgetFavoriteModel = (model: Model) => {    
    realm.write(() => {
      pilot!.favoriteModels =
        pilot?.favoriteModels.filter(m => m._id.toString() !== model._id.toString()) || [];
    });
  };

  const reorderFavoriteModels = (data: Model[]) => {
    realm.write(() => {
      pilot!.favoriteModels = data;
    });
  };

  const renderFavoriteModel = ({
    item: model,
    getIndex,
    drag,
    isActive,
  }: RenderItemParams<Model>) => {
    const index = getIndex();
    if (index === undefined) return null;
    return (
      <View
        key={index}
        style={[isActive ? s.shadow : {}]}>
      <ListItem
        title={model.name}
        subtitle={`${model.type} with ${model.totalEvents} flights, ${model.totalTime} total time`}
        titleStyle={s.modelText}
        subtitleStyle={s.modelText}
        subtitleNumberOfLines={1}
        position={pilot!.favoriteModels.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === pilot!.favoriteModels.length - 1 ? ['last'] : []}
        rightImage={false}
        leftImage={
          <View style={s.modelIconContainer}>
            <SvgXml
              xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
              width={60}
              height={60}
              color={theme.colors.brandPrimary}
              style={s.modelIcon}
            />
          </View>
        }
        drag={drag}
        editable={{
          item: {
            icon: 'remove-circle',
            color: theme.colors.assertive,
            action: 'open-swipeable',
          },
          reorder: true,
        }}
        showEditor={listEditModeEnabled}
        swipeable={{
          rightItems: [{
            icon: 'eye-slash',
            iconType: 'font-awesome',
            text: 'Forget',
            color: theme.colors.brandPrimary,
            x: 64,
            onPress: () => forgetFavoriteModel(model),
          }]
        }}
      />
      </View>
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={theme.styles.view}>
      <NestableScrollContainer
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
        {pilot?.favoriteModels && pilot.favoriteModels.length > 0 &&
          <>
            <Divider text={'FAVORITE MODELS'}/>
            <NestableDraggableFlatList
              data={pilot.favoriteModels}
              renderItem={renderFavoriteModel}
              keyExtractor={(_item, index) => `${index}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              style={s.favoriteModelsList}
              animationConfig={{
                damping: 20,
                mass: 0.01,
                stiffness: 100,
                overshootClamping: false,
                restSpeedThreshold: 0.2,
                restDisplacementThreshold: 2,
              }}
              onDragEnd={({ data }) => reorderFavoriteModels(data)}
            />
          </>
        }
        <Divider />
        <ListItem
          title={'Select Favorite Models'}
          titleStyle={s.actionButtonTitle}
          position={['first', 'last']}
          rightImage={false}
          onPress={() => navigation.navigate('PilotNavigator',{
            screen:'ModelPicker',
            params: {
              title: 'Models',
              selected: pilot!.favoriteModels,
              mode: 'many',
              eventName: 'pilot-favorite-models',
            }
          })}
        />
        <Divider />
      </NestableScrollContainer>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  actionButtonTitle: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton
  },
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
  favoriteModelsList: {
    overflow: 'visible',      
  },
  modelIcon: {
    transform: [{rotate: '-45deg'}],
  },
  modelIconContainer: {
    position: 'absolute',
    left: -15,
  },
  modelText: {
    left: 35,
    maxWidth: '92%',
  },
  shadow: {
    ...theme.styles.shadowGlow,
    ...Platform.select({
      android: {
        borderRadius: 20,
      },
    }),
  },
}));

export default PilotScreen;
