import { AppTheme, useTheme } from 'theme';
import {
  Divider,
  getColoredSvg,
  useListEditor,
} from '@react-native-ajp-elements/ui';
import { EventStyleStatistics, eventStyleSummaryPilot } from 'lib/modelEvent';
import {
  FlatList,
  Image,
  Keyboard,
  ListRenderItem,
  Platform,
  View,
} from 'react-native';
import {
  ListItem,
  ListItemInput,
  listItemPosition,
} from 'components/atoms/List';
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import React, { useEffect, useRef, useState } from 'react';
import { modelSummary, modelSummaryPilot } from 'lib/model';
import { useObject, useQuery, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rn-vui/base';
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import { Event } from 'realmdb/Event';
import { FilterType } from 'types/filter';
import { Model } from 'realmdb/Model';
import { ModelPickerResult } from 'components/ModelPickerScreen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { SetupNavigatorParamList } from 'types/navigation';
import { SvgXml } from 'react-native-svg';
import { eqString } from 'realmdb/helpers';
import lodash from 'lodash';
import { makeStyles } from '@rn-vui/themed';
import { modelTypeIcons } from 'lib/model';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useEvent } from 'lib/event';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Pilot'>;

const PilotScreen = ({ navigation, route }: Props) => {
  const { pilotId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const setDebounced = useDebouncedRender();
  const listEditor = useListEditor();
  const event = useEvent();
  const realm = useRealm();

  const pilot = useObject(Pilot, new BSON.ObjectId(pilotId));
  const allPilotModels = useQuery(Model, models =>
    models.filtered(`events.pilot._id == $0`, pilot?._id),
  );
  const allPilotEventStyles = useQuery(Event, events =>
    events.filtered(`pilot._id == $0`, pilot?._id),
  );

  // Compute event count and event duration stats for each event involving the pilot.
  const eventStyleStatistics: Record<string, EventStyleStatistics> = {};
  const groupedPilotEventStyles = lodash.groupBy(
    allPilotEventStyles,
    s => s.eventStyle?.name || 'Unspecified',
  );
  Object.keys(groupedPilotEventStyles).forEach(eventStyleName => {
    const count = groupedPilotEventStyles[eventStyleName].length;
    const duration = groupedPilotEventStyles[eventStyleName].reduce(
      (accumulator, event) => {
        return (accumulator += event.duration);
      },
      0,
    );
    eventStyleStatistics[eventStyleName] = { eventStyleName, count, duration };
  });

  const name = useRef(pilot?.name);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const canSave = name.current && !eqString(pilot?.name, name.current);

    const save = () => {
      if (pilot) {
        realm.write(() => {
          pilot.updatedOn = DateTime.now().toISO();
          pilot.name = name.current || 'no-name';
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
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft: () => {
        if (isEditing) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={() => {
                Keyboard.dismiss();
                setIsEditing(false);
              }}
            />
          );
        }
      },
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => {
        if (canSave) {
          return (
            <Button
              title={'Done'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={onDone}
            />
          );
        } else if (pilot?.favoriteModels && pilot.favoriteModels.length > 1) {
          return (
            <Button
              title={listEditor.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={listEditor.onEdit}
            />
          );
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, listEditor.enabled, name.current, pilot?.favoriteModels]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('pilot-favorite-models', onChangeFavoriteModels);

    return () => {
      event.removeListener('pilot-favorite-models', onChangeFavoriteModels);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeFavoriteModels = (result: ModelPickerResult) => {
    if (pilot) {
      realm.write(() => {
        pilot.updatedOn = DateTime.now().toISO();
        pilot.favoriteModels = result.models;
      });
    }
  };

  const forgetFavoriteModel = (model: Model) => {
    if (pilot) {
      realm.write(() => {
        pilot.updatedOn = DateTime.now().toISO();
        pilot.favoriteModels =
          pilot.favoriteModels.filter(
            m => m._id.toString() !== model._id.toString(),
          ) || [];
      });
    }
  };

  const reorderFavoriteModels = (data: Model[]) => {
    if (pilot) {
      realm.write(() => {
        pilot.favoriteModels = data;
      });
    }
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
      <View key={index} style={[isActive ? s.shadow : {}]}>
        <ListItem
          ref={ref => {
            ref && listEditor.add(ref, 'favorite-models', model._id.toString());
          }}
          title={model.name}
          subtitle={modelSummary(model)}
          titleStyle={s.modelText}
          subtitleStyle={s.modelText}
          subtitleNumberOfLines={2}
          position={listItemPosition(index, pilot?.favoriteModels.length || 0)}
          rightImage={false}
          leftImage={
            <View style={s.modelIconContainer}>
              {model.image ? (
                <Image
                  source={{ uri: model.image }}
                  resizeMode={'cover'}
                  style={s.modelImage}
                />
              ) : (
                <View style={s.modelSvgContainer}>
                  <SvgXml
                    xml={getColoredSvg(
                      modelTypeIcons[model.type]?.name as string,
                    )}
                    width={s.modelImage.width}
                    height={s.modelImage.height}
                    color={theme.colors.brandSecondary}
                    style={s.modelIcon}
                  />
                </View>
              )}
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
          showEditor={listEditor.show}
          swipeable={{
            rightItems: [
              {
                icon: 'eye-slash',
                iconType: 'font-awesome',
                text: 'Forget',
                color: theme.colors.brandPrimary,
                x: 64,
                onPress: () => forgetFavoriteModel(model),
              },
            ],
          }}
          onSwipeableWillOpen={() =>
            listEditor.onItemWillOpen('favorite-models', model._id.toString())
          }
          onSwipeableWillClose={listEditor.onItemWillClose}
        />
      </View>
    );
  };

  const renderModel: ListRenderItem<Model> = ({ item: model, index }) => {
    return (
      <ListItem
        title={model.name}
        value={pilot ? modelSummaryPilot(model, pilot) : ''}
        position={listItemPosition(index, allPilotModels.length)}
        onPress={() =>
          navigation.navigate('Events', {
            filterType: FilterType.BypassFilter,
            modelId: model._id.toString(),
            pilotId: pilot?._id.toString(),
          })
        }
      />
    );
  };

  const renderEventStyle: ListRenderItem<string> = ({
    item: eventStyleName,
    index,
  }) => {
    const event = groupedPilotEventStyles[eventStyleName][0];
    return (
      <ListItem
        title={eventStyleName || 'Unspecified'}
        value={eventStyleSummaryPilot(eventStyleStatistics[eventStyleName])}
        position={listItemPosition(index, allPilotEventStyles.length)}
        onPress={() =>
          navigation.navigate('Events', {
            filterType: FilterType.BypassFilter,
            eventStyleId: event.eventStyle?._id.toString() || 'unspecified',
            pilotId: pilot?._id.toString(),
          })
        }
      />
    );
  };

  if (!pilot) {
    return <EmptyView error message={'Pilot not found!'} />;
  }

  return (
    <NestableScrollContainer
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={"PILOT'S NAME"} />
      <ListItemInput
        value={name.current}
        placeholder={'Pilot Name'}
        position={['first', 'last']}
        onBlur={() => setIsEditing(false)}
        onFocus={() => setIsEditing(true)}
        onChangeText={value => setDebounced(() => (name.current = value))}
      />
      {allPilotModels.length ? (
        <>
          <Divider text={'MODEL USAGE'} />
          <FlatList
            data={allPilotModels}
            renderItem={renderModel}
            scrollEnabled={false}
          />
          <Divider
            note
            text={
              'Total duration (H:MM) and number of events of each style for events piloted by Andy.'
            }
          />
        </>
      ) : null}
      {allPilotModels.length ? (
        <>
          <Divider text={'EVENT STYLES'} />
          <FlatList
            data={Object.keys(groupedPilotEventStyles).sort()}
            renderItem={renderEventStyle}
            scrollEnabled={false}
          />
          <Divider
            note
            text={
              'Total duration (H:MM) and number of events of each style for events piloted by Andy.'
            }
          />
        </>
      ) : null}
      {pilot?.favoriteModels && pilot.favoriteModels.length > 0 && (
        <>
          <Divider text={'FAVORITE MODELS'} />
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
      )}
      <Divider />
      <ListItem
        title={'Select Favorite Models'}
        titleStyle={s.actionButtonTitle}
        position={['first', 'last']}
        rightImage={false}
        onPress={() =>
          navigation.navigate('PilotNavigator', {
            screen: 'ModelPicker',
            params: {
              title: 'Models',
              selected: pilot.favoriteModels,
              mode: 'many',
              eventName: 'pilot-favorite-models',
            },
          })
        }
      />
      <Divider />
    </NestableScrollContainer>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  actionButtonTitle: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.clearButtonText,
  },
  favoriteModelsList: {
    overflow: 'visible',
  },
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  modelIconContainer: {
    position: 'absolute',
    left: -15,
  },
  modelImage: {
    width: 150,
    height: 85,
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
  modelText: {
    left: 140,
    maxWidth: '48%',
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
