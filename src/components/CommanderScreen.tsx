import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  LayoutRectangle,
  ListRenderItem,
  View,
} from 'react-native';
import {
  DragEndParams,
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { SvgXml } from 'react-native-svg';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItem,
  ListItemSwipeable,
  ThemeManager,
  getColoredSvg,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useQuery, useRealm } from '@realm/react';
import { ModelPickerResult } from 'components/ModelPickerScreen';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemInputMethods } from 'components/atoms/List';
import { EmptyView } from 'components/molecules/EmptyView';
import { Formik, FormikProps } from 'formik';
import {
  modelSummary,
  modelSummaryCommander,
  modelTypeIconProps,
} from 'lib/model';
import {
  EventStyleStatistics,
  eventStyleSummaryCommander,
} from 'lib/modelEvent';
import lodash from 'lodash';
import { CircleMinus, Plus, StarOff } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Commander } from 'realmdb/Commander';
import { Event } from 'realmdb/Event';
import { Model } from 'realmdb/Model';
import { FilterType } from 'types/filter';
import { SetupNavigatorParamList } from 'types/navigation';
import * as Yup from 'yup';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'Commander'
>;

// Order of fields for accessory view.
enum Fields {
  name,
}

type FormValues = {
  name: string;
};

const CommanderScreen = ({ navigation, route }: Props) => {
  const { commanderId } = route.params;

  const theme = useTheme();
  const s = useStyles();

  const event = useEvent();
  const realm = useRealm();

  const commander = useObject(Commander, new BSON.ObjectId(commanderId));
  const allCommanderModels = useQuery(Model, models =>
    models.filtered(`events.commander._id == $0`, commander?._id),
  );
  const allCommanderEventStyles = useQuery(Event, events =>
    events.filtered(`commander._id == $0`, commander?._id),
  );

  // Compute event count and event duration stats for each event involving the commander.
  const eventStyleStatistics: Record<string, EventStyleStatistics> = {};
  const groupedCommanderEventStyles = lodash.groupBy(
    allCommanderEventStyles,
    s => s.eventStyle?.name || 'Unspecified',
  );
  Object.keys(groupedCommanderEventStyles).forEach(eventStyleName => {
    const count = groupedCommanderEventStyles[eventStyleName].length;
    const duration = groupedCommanderEventStyles[eventStyleName].reduce(
      (accumulator, event) => {
        return (accumulator += event.duration);
      },
      0,
    );
    eventStyleStatistics[eventStyleName] = { eventStyleName, count, duration };
  });

  const initialValues = {
    name: commander?.name,
  } as FormValues;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();
  const [listLayout, setListLayout] = useState<LayoutRectangle>();

  useEffect(() => {
    navigation.setOptions({
      title: commander?.name,
      headerRight: renderListEditButton,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listEditorState, commander?.favoriteModels.length]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('commander-favorite-models', onChangeFavoriteModels);

    return () => {
      event.removeListener('commander-favorite-models', onChangeFavoriteModels);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    Keyboard.dismiss();
    formikRef.current?.resetForm();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
  };

  const onSubmit = (values: FormValues) => {
    if (commander) {
      realm.write(() => {
        commander.updatedOn = DateTime.now().toISO();
        commander.name = values.name || 'no-name';
      });
    }
  };

  const onChangeFavoriteModels = (result: ModelPickerResult) => {
    if (commander) {
      realm.write(() => {
        commander.updatedOn = DateTime.now().toISO();
        commander.favoriteModels = [...result.models];
      });
    }
  };

  const removeFavoriteModel = (modelId: string) => {
    if (commander) {
      realm.write(() => {
        commander.updatedOn = DateTime.now().toISO();
        commander.favoriteModels =
          commander.favoriteModels.filter(m => !m._id.equals(modelId)) || [];
      });

      // Exit edit mode if no more favorites in the list.
      if (!commander.favoriteModels.length) {
        listEditorRef.current?.onToggleEditMode();
      }
    }
  };

  const reorderFavoriteModels = (params: DragEndParams<Model>) => {
    const { data } = params;
    if (commander) {
      realm.write(() => {
        commander.favoriteModels = data;
      });
    }
  };

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, changedFields, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);

    // Update header as name changes.
    if (changedFields?.includes('name')) {
      navigation.setOptions({
        title: next?.values.name,
      });
    }

    navigation.setOptions({
      headerLeft: () => {
        if (next.dirty) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={cancel}
            />
          );
        }
      },
      headerRight: () => {
        if (next.dirty) {
          return (
            <Button
              title={'Save'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledTitleStyle={theme.styles.buttonScreenHeaderTitle}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!canSubmit}
              onPress={save}
            />
          );
        } else if (
          commander?.favoriteModels &&
          commander.favoriteModels.length > 0
        ) {
          return renderListEditButton();
        }
      },
    });
  };

  const renderListEditButton = () => {
    if (!commander?.favoriteModels.length) return null;
    return (
      <Button
        title={listEditorState?.enabled ? 'Done' : 'Edit'}
        titleStyle={theme.styles.buttonScreenHeaderTitle}
        buttonStyle={theme.styles.buttonScreenHeader}
        onPress={() => listEditorRef.current?.onToggleEditMode()}
      />
    );
  };

  const renderFavoriteModel = ({
    item: model,
    getIndex,
    drag,
    isActive,
  }: RenderItemParams<Model>) => {
    const index = getIndex();
    if (index === undefined) return null;
    const modelId = model._id.toString();
    return (
      <ListItemSwipeable
        title={model.name}
        subtitle={modelSummary(model)}
        subtitleLines={2}
        position={listItemPosition(
          index,
          commander?.favoriteModels.length || 0,
        )}
        listEditor={listEditorRef.current}
        leftContentStyle={{ paddingLeft: 0 }}
        leftContent={
          <View>
            {model.image ? (
              <Image
                source={{ uri: model.image }}
                resizeMode={'cover'}
                style={s.modelImage}
              />
            ) : (
              <View style={s.modelSvgContainer}>
                <SvgXml
                  xml={getColoredSvg(modelTypeIconProps[model.type]?.name)}
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
        dragIsActive={isActive}
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
          draggable: true,
        }}
        swipeableActionsRight={[
          {
            text: 'Remove',
            color: theme.colors.brandPrimary,
            ButtonComponent: <StarOff color={theme.colors.stickyWhite} />,
            op: 'remove',
            onPress: () => {
              removeFavoriteModel(modelId);
              listEditorState?.enabled
                ? listEditorRef.current?.onToggleEditMode()
                : null;
            },
          },
        ]}
      />
    );
  };

  const renderModel: ListRenderItem<Model> = ({ item: model, index }) => {
    return (
      <ListItem
        title={model.name}
        value={commander ? modelSummaryCommander(model, commander) : ''}
        position={listItemPosition(index, allCommanderModels.length)}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('Events', {
            filterType: FilterType.BypassFilter,
            modelId: model._id.toString(),
            commanderId: commander?._id.toString(),
          })
        }
      />
    );
  };

  const renderEventStyle: ListRenderItem<string> = ({
    item: eventStyleName,
    index,
  }) => {
    const event = groupedCommanderEventStyles[eventStyleName][0];
    return (
      <ListItem
        title={eventStyleName || 'Unspecified'}
        value={eventStyleSummaryCommander(eventStyleStatistics[eventStyleName])}
        position={listItemPosition(index, allCommanderEventStyles.length)}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('Events', {
            filterType: FilterType.BypassFilter,
            eventStyleId: event.eventStyle?._id.toString(),
            commanderId: commander?._id.toString(),
          })
        }
      />
    );
  };

  if (!commander) {
    return <EmptyView error message={'Commander not found!'} />;
  }

  return (
    <>
      <ListEditor
        ref={listEditorRef}
        onChangeState={setListEditorState}
        listLayout={listLayout}>
        <NestableScrollContainer
          style={theme.styles.view}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}>
          <Formik
            innerRef={formik => {
              if (formik) {
                formikRef.current = formik;
              }
            }}
            initialValues={initialValues}
            validationSchema={schema}
            validateOnMount
            onSubmit={onSubmit}>
            {({ handleChange, values }) => (
              <View>
                <FormikStateWatcher<FormValues>
                  onChange={onFormikWatcherStateChange}
                />
                <Divider />
                <ListItemInput
                  ref={nameFieldRef}
                  position={['first', 'last']}
                  inputProps={{
                    inputAccessoryViewID: 'keyboardAccessory',
                    onChangeText: handleChange('name'),
                    onFocus: () =>
                      keyboardAccessory.current?.focusedField(Fields.name),
                    value: values.name,
                    label: 'Name',
                    placeholder: 'Name',
                    autoCapitalize: 'words',
                  }}
                />
              </View>
            )}
          </Formik>
          {allCommanderModels.length ? (
            <>
              <Divider text={'MODEL USAGE'} />
              <FlatList
                data={allCommanderModels}
                renderItem={renderModel}
                scrollEnabled={false}
              />
              <Divider
                note
                light
                subHeaderStyle={theme.text.medium}
                text={`Total duration and number of events for each model.`}
              />
            </>
          ) : null}
          {allCommanderModels.length ? (
            <>
              <Divider text={'EVENT STYLES'} />
              <FlatList
                data={Object.keys(groupedCommanderEventStyles).sort()}
                renderItem={renderEventStyle}
                scrollEnabled={false}
              />
              <Divider
                note
                light
                subHeaderStyle={theme.text.medium}
                text={`Total duration and number of events for each style.`}
              />
            </>
          ) : null}
          <Divider
            text={'FAVORITE MODELS'}
            rightComponent={
              <Button
                buttonStyle={theme.styles.dividerIconButton}
                icon={<Plus color={theme.colors.screenHeaderButtonText} />}
                onPress={() =>
                  navigation.navigate('CommanderNavigator', {
                    screen: 'ModelPicker',
                    params: {
                      title: 'Models',
                      selected: commander.favoriteModels,
                      mode: 'many',
                      eventName: 'commander-favorite-models',
                    },
                  })
                }
              />
            }
          />
          {commander?.favoriteModels && commander.favoriteModels.length > 0 ? (
            <>
              <View
                style={[{ flex: 1 }]}
                onLayout={e => setListLayout(e.nativeEvent.layout)}>
                <NestableDraggableFlatList
                  data={[...commander.favoriteModels]}
                  renderItem={renderFavoriteModel}
                  keyExtractor={item => `${item._id.toString()}`}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  style={s.favoriteModelsList}
                  onDragEnd={reorderFavoriteModels}
                />
              </View>
              <Divider />
            </>
          ) : (
            <Divider
              note
              light
              text={"Tap '+' to add a favorite model."}
              subHeaderStyle={{ textAlign: 'center' }}
            />
          )}
        </NestableScrollContainer>
      </ListEditor>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={[nameFieldRef.current]}
        doneText={'Done'}
        disabledDone={!formikCanSubmit}
        onDone={Keyboard.dismiss}
      />
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  favoriteModelsList: {
    overflow: 'visible',
  },
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  modelImage: {
    width: 150,
    height: 85,
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
}));

export default CommanderScreen;
