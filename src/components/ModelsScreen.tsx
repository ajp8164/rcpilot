import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { AchievementModal } from 'components/modals/AchievementModal';
import { EmptyView } from 'components/molecules/EmptyView';
import { ModelListItem } from 'components/molecules/ModelListItem';
import { ModelPostCard } from 'components/molecules/ModelPostCard';
import { ModelCardDeck } from 'components/molecules/card-deck/ModelCardDeck';
import { modelMaintenanceIsDue, useModelsFilter } from 'lib/model';
import { eventKind } from 'lib/modelEvent';
import { groupItems } from 'lib/sectionList';
import {
  Funnel,
  FunnelPlus,
  GalleryHorizontalEnd,
  Images,
  LayoutList,
  Plus,
} from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Commander } from 'realmdb/Commander';
import { Model } from 'realmdb/Model';
import { selectModelsLayout } from 'store/selectors/appSettingsSelectors';
import { selectCommander } from 'store/selectors/commanderSelectors';
import { selectFilters } from 'store/selectors/filterSelectors';
import { saveModelsLayout } from 'store/slices/appSettings';
import { eventSequence } from 'store/slices/eventSequence';
import { ChecklistType } from 'types/checklist';
import { FilterType } from 'types/filter';
import { ModelsNavigatorParamList } from 'types/navigation';
import { ModelsLayout } from 'types/preferences';

type Section = {
  title?: string;
  data: Model[];
};

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'Models'>;

const ModelsScreen = ({ navigation, route }: Props) => {
  const { listModels } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const dispatch = useDispatch();
  const realm = useRealm();
  const headerHeight = useHeaderHeight();

  const _commander = useSelector(selectCommander);
  const modelsLayout = useSelector(selectModelsLayout);
  const filterId = useSelector(selectFilters(FilterType.ModelsFilter));

  const models = useModelsFilter();
  const activeModels = models.filtered('retired == $0', false);
  const retiredModels = models.filtered('retired == $0', true);
  const commander =
    useObject(Commander, new BSON.ObjectId(_commander.commanderId)) ||
    undefined;

  const achievementModalRef = useRef<AchievementModal>(null);

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        if (listModels === 'all' && modelsLayout === ModelsLayout.List) {
          return (
            <Button
              title={
                activeModels.length && listEditorState?.enabled
                  ? 'Done'
                  : 'Edit'
              }
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabled={!activeModels.length}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              onPress={() => listEditorRef.current?.onToggleEditMode()}
            />
          );
        } else {
          return null;
        }
      },
      headerRight: () => {
        return (
          <>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!activeModels.length}
              headerRight
              icon={
                modelsLayout === ModelsLayout.CardDeck ? (
                  <GalleryHorizontalEnd
                    color={theme.colors.screenHeaderButtonText}
                    size={28}
                  />
                ) : modelsLayout === ModelsLayout.List ? (
                  <LayoutList
                    color={theme.colors.screenHeaderButtonText}
                    size={28}
                  />
                ) : modelsLayout === ModelsLayout.PostCards ? (
                  <Images
                    color={theme.colors.screenHeaderButtonText}
                    size={28}
                  />
                ) : (
                  <></>
                )
              }
              onPress={() => {
                const presentation =
                  modelsLayout === ModelsLayout.CardDeck
                    ? ModelsLayout.List
                    : modelsLayout === ModelsLayout.List
                      ? ModelsLayout.PostCards
                      : modelsLayout === ModelsLayout.PostCards
                        ? ModelsLayout.CardDeck
                        : ModelsLayout.List;

                dispatch(saveModelsLayout({ presentation }));
              }}
            />
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={
                !filterId && (!activeModels.length || listEditorState?.enabled)
              }
              headerRight
              icon={
                filterId ? (
                  <FunnelPlus
                    color={theme.colors.screenHeaderButtonText}
                    size={28}
                  />
                ) : (
                  <Funnel
                    color={theme.colors.screenHeaderButtonText}
                    size={28}
                  />
                )
              }
              onPress={() =>
                navigation.navigate('ModelFiltersNavigator', {
                  screen: 'ModelFilters',
                  params: {
                    filterType: FilterType.ModelsFilter,
                    useGeneralFilter: true,
                  },
                })
              }
            />
            {listModels !== 'all' ? (
              <Button
                title={
                  activeModels.length && listEditorState?.enabled
                    ? 'Done'
                    : 'Edit'
                }
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.buttonScreenHeader}
                disabled={!retiredModels.length}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                onPress={() => listEditorRef.current?.onToggleEditMode()}
              />
            ) : (
              <Button
                buttonStyle={theme.styles.buttonScreenHeader}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                disabled={!!activeModels.length && listEditorState?.enabled}
                headerRight
                icon={
                  <Plus color={theme.colors.screenHeaderButtonText} size={28} />
                }
                onPress={() =>
                  navigation.navigate('NewModelNavigator', {
                    screen: 'NewModel',
                    params: {},
                  })
                }
              />
            )}
          </>
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeModels.length,
    modelsLayout,
    filterId,
    listEditorState?.enabled,
    retiredModels,
  ]);

  const groupModels = (
    models: Realm.Results<Model>,
  ): SectionListData<Model, Section>[] => {
    const groups = groupItems<Model, Section>(models, model => {
      if (
        commander &&
        commander.favoriteModels.find(
          m => m._id.toString() === model._id.toString(),
        )
      ) {
        return `FAVORITE MODELS FOR ${commander.name.toUpperCase()}`;
      }
      if (model.category) {
        return `${model.type.toUpperCase()} - ${model.category.name.toUpperCase()}`;
      }
      return `${model.type.toUpperCase()}S`;
    }).sort((a, b) => {
      return a.title?.includes('FAVORITE')
        ? -1
        : b.title?.includes('FAVORITE')
          ? 1
          : 0;
    });

    return groups;
  };

  const confirmStartNewEventSequence = (model: Model) => {
    if (modelMaintenanceIsDue(model)) {
      Alert.alert(
        'Maintenance Due',
        `This ${model.type.toLowerCase()} has one or more maintenance actions due.\n\nAre you sure you want to use it for this ${eventKind(model.type).name.toLowerCase()}?`,
        [
          { text: 'Yes', onPress: () => startNewEventSequence(model) },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: false },
      );
    } else if (model.damaged) {
      Alert.alert(
        `Damaged ${model.type}`,
        `This ${model.type.toLowerCase()} is marked as damaged.\n\nAre you sure you want to use it for this ${eventKind(model.type).name.toLowerCase()}?`,
        [
          { text: 'Yes', onPress: () => startNewEventSequence(model) },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: false },
      );
    } else {
      startNewEventSequence(model);
    }
  };

  const startNewEventSequence = (model: Model) => {
    dispatch(eventSequence.reset());
    dispatch(eventSequence.setModel({ modelId: model._id.toString() }));

    const checklists = model?.checklists.filter(c => {
      return c.type === ChecklistType.PreEvent;
    });

    if (model.logsBatteries) {
      navigation.navigate('EventSequenceNavigator', {
        screen: 'EventSequenceBatteryPicker',
        params: { cancelable: true },
      });
    } else if (checklists.length) {
      navigation.navigate('EventSequenceNavigator', {
        screen: 'EventSequenceChecklist',
        params: { cancelable: true, checklistType: ChecklistType.PreEvent },
      });
    } else {
      navigation.navigate('EventSequenceNavigator', {
        screen: 'EventSequenceTimer',
        params: { cancelable: true },
      });
    }
  };

  const toggleFavoriteModel = (commander: Commander, model: Model) => {
    const isFavorite = !!commander.favoriteModels.filter(m =>
      m._id.equals(model._id),
    ).length;

    realm.write(() => {
      commander.updatedOn = DateTime.now().toISO();
      if (isFavorite) {
        // Remove
        commander.favoriteModels =
          commander.favoriteModels.filter(m => !m._id.equals(model._id)) || [];
      } else {
        // Add
        commander.favoriteModels = [...commander.favoriteModels, model];
      }
    });
  };

  const renderModelPostCard: SectionListRenderItem<Model, Section> = ({
    item: model,
    section: _model,
    index: _index,
  }: {
    item: Model;
    section: Section;
    index: number;
  }) => {
    return (
      <ModelPostCard
        model={model}
        commander={commander}
        onPressAchievements={(commander, model) =>
          achievementModalRef.current?.present(commander, model)
        }
        onPressEditModel={() =>
          navigation.navigate('ModelEditor', {
            modelId: model._id.toString(),
          })
        }
        onPressFavoriteModel={toggleFavoriteModel}
        onPressNewEvent={() => {
          if (listModels !== 'all') {
            navigation.navigate('ModelEditor', {
              modelId: model._id.toString(),
            });
          } else {
            confirmStartNewEventSequence(model);
          }
        }}
      />
    );
  };

  const renderModelListItem: SectionListRenderItem<Model, Section> =
    useCallback(
      ({
        item: model,
        section,
        index,
      }: {
        item: Model;
        section: Section;
        index: number;
      }) => {
        return (
          <ModelListItem
            array={section.data}
            index={index}
            model={model}
            listEditor={listEditorRef.current}
            showInfo={listModels === 'all'}
            onPress={() => {
              if (listModels !== 'all') {
                navigation.navigate('ModelEditor', {
                  modelId: model._id.toString(),
                });
              } else {
                confirmStartNewEventSequence(model);
              }
            }}
            onPressInfo={() => {
              navigation.navigate('ModelEditor', {
                modelId: model._id.toString(),
              });
            }}
          />
        );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [listEditorRef, listEditorState],
    );

  const renderInactive = () => {
    return listModels === 'all' && retiredModels.length ? (
      <>
        <Divider text={'INACTIVE MODELS'} />
        <ListItem
          title={'Retired'}
          value={`${retiredModels.length}`}
          position={['first', 'last']}
          onPress={() =>
            navigation.push('Models', {
              listModels: 'retired',
            })
          }
        />
        <Divider />
      </>
    ) : (
      <Divider />
    );
  };

  if (!filterId && listModels === 'retired' && !retiredModels.length) {
    return <EmptyView info message={'No Retired Models'} />;
  }

  if (
    (filterId &&
      listModels === 'all' &&
      !activeModels.length &&
      !retiredModels.length) ||
    (filterId && listModels === 'retired' && !retiredModels.length)
  ) {
    return (
      <EmptyView
        message={'No Models Match Your Filter'}
        details={'Adjust your filter settings to see your models.'}
        buttonTitle={'Adjust Filter'}
        onButtonPress={() =>
          navigation.navigate('ModelFiltersNavigator', {
            screen: 'ModelFilters',
            params: {
              filterType: FilterType.ModelsFilter,
              useGeneralFilter: true,
            },
          })
        }
      />
    );
  }

  if (!filterId && !activeModels.length && !retiredModels.length) {
    return (
      <EmptyView
        info
        message={'No Models'}
        details={'Tap the + button to a add Model.'}
        buttonTitle={'Add Model'}
        onButtonPress={() =>
          navigation.navigate('NewModelNavigator', {
            screen: 'NewModel',
            params: {},
          })
        }
      />
    );
  }

  return (
    <>
      {modelsLayout === ModelsLayout.CardDeck ? (
        <View style={[theme.styles.view, s.noPadding]}>
          <ModelCardDeck
            models={activeModels}
            commander={commander}
            onStartNewEventSequence={confirmStartNewEventSequence}
            onPressAchievements={(commander, model) =>
              achievementModalRef.current?.present(commander, model)
            }
          />
        </View>
      ) : (
        <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
          <>
            {listEditorRef.current ? (
              <SectionList
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior={'automatic'}
                stickySectionHeadersEnabled={true}
                contentContainerStyle={{
                  flexGrow: 1,
                  marginBottom: headerHeight,
                }}
                bounces={true}
                alwaysBounceVertical={true}
                style={[
                  theme.styles.view,
                  modelsLayout === ModelsLayout.PostCards ? s.noPadding : {},
                ]}
                sections={groupModels(
                  listModels === 'retired' ? retiredModels : activeModels,
                )}
                keyExtractor={item => item._id.toString()}
                renderItem={section =>
                  modelsLayout === ModelsLayout.PostCards &&
                  listModels !== 'retired'
                    ? renderModelPostCard(section)
                    : renderModelListItem(section)
                }
                renderSectionHeader={({ section: { title } }) => (
                  <View style={theme.styles.listSectionHeader}>
                    <Divider text={title} />
                  </View>
                )}
                ListFooterComponent={renderInactive()}
              />
            ) : null}
          </>
        </ListEditor>
      )}
      <AchievementModal ref={achievementModalRef} />
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  noPadding: {
    paddingHorizontal: 0,
  },
}));

export default ModelsScreen;
