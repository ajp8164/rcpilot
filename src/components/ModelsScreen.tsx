import {
  Alert,
  SectionList,
  SectionListData,
  SectionListRenderItem,
} from 'react-native';
import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { ListItem, SectionListHeader } from 'components/atoms/List';
import React, { useEffect, useRef } from 'react';
import { useModelsFilter } from 'lib/model';
import { useDispatch, useSelector } from 'react-redux';
import { useObject } from '@realm/react';

import { AchievementModal } from 'components/modals/AchievementModal';
import { BSON } from 'realm';
import { Button } from '@rn-vui/base';
import { ChecklistType } from 'types/checklist';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { EmptyView } from 'components/molecules/EmptyView';
import { FilterType } from 'types/filter';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { eventKind } from 'lib/modelEvent';
import { eventSequence } from 'store/slices/eventSequence';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rn-vui/themed';
import { modelMaintenanceIsDue } from 'lib/model';
import { selectModelsLayout } from 'store/selectors/appSettingsSelectors';
import { selectFilters } from 'store/selectors/filterSelectors';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { ModelCardDeck } from 'components/molecules/card-deck/ModelCardDeck';
import { ModelPostCard } from 'components/molecules/ModelPostCard';
import { ModelListItem } from 'components/molecules/ModelListItem';
import { ModelsLayout } from 'types/preferences';

type Section = {
  title?: string;
  data: Model[];
};

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'Models'>;

const ModelsScreen = ({ navigation, route }: Props) => {
  const { listModels } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const dispatch = useDispatch();

  const _pilot = useSelector(selectPilot);
  const modelsLayout = useSelector(selectModelsLayout);
  const filterId = useSelector(selectFilters(FilterType.ModelsFilter));

  const models = useModelsFilter();
  const activeModels = models.filtered('retired == $0', false);
  const retiredModels = models.filtered('retired == $0', true);
  const pilot =
    useObject(Pilot, new BSON.ObjectId(_pilot.pilotId)) || undefined;

  const achievementModalRef = useRef<AchievementModal>(null);

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft: () => {
        if (listModels === 'all' && modelsLayout === ModelsLayout.List) {
          return (
            <Button
              title={listEditor.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabled={!activeModels.length}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              onPress={listEditor.onEdit}
            />
          );
        } else {
          return null;
        }
      },
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => {
        return (
          <>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={
                !filterId && (!activeModels.length || listEditor.enabled)
              }
              icon={
                <CustomIcon
                  name={filterId ? 'filter-check' : 'filter'}
                  style={[
                    s.headerIcon,
                    !filterId && (!activeModels.length || listEditor.enabled)
                      ? s.headerIconDisabled
                      : {},
                  ]}
                />
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
                title={listEditor.enabled ? 'Done' : 'Edit'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.buttonScreenHeader}
                disabled={!retiredModels.length}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                onPress={listEditor.onEdit}
              />
            ) : (
              <Button
                buttonStyle={theme.styles.buttonScreenHeader}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                disabled={listEditor.enabled}
                icon={
                  <Icon
                    name={'plus'}
                    style={[
                      s.headerIcon,
                      listEditor.enabled ? s.headerIconDisabled : {},
                    ]}
                  />
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
  }, [activeModels, modelsLayout, filterId, listEditor.enabled, retiredModels]);

  const groupModels = (
    models: Realm.Results<Model>,
  ): SectionListData<Model, Section>[] => {
    const groups = groupItems<Model, Section>(models, model => {
      if (
        pilot &&
        pilot.favoriteModels.find(
          m => m._id.toString() === model._id.toString(),
        )
      ) {
        return `FAVORITE MODELS FOR ${pilot.name.toUpperCase()}`;
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
        pilot={pilot}
        onPressAchievements={(pilot, model) =>
          achievementModalRef.current?.present(pilot, model)
        }
        onPressEditModel={() =>
          navigation.navigate('ModelEditor', {
            modelId: model._id.toString(),
          })
        }
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

  const renderModelListItem: SectionListRenderItem<Model, Section> = ({
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
        listEditor={listEditor}
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
  };

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
    return <EmptyView message={'No Models Match Your Filter'} />;
  }

  if (!filterId && !activeModels.length && !retiredModels.length) {
    return (
      <EmptyView
        info
        message={'No Models'}
        details={'Tap the + button to add your first model.'}
      />
    );
  }

  return (
    <>
      {modelsLayout === ModelsLayout.CardDeck ? (
        <ModelCardDeck
          models={activeModels}
          pilot={pilot}
          onStartNewEventSequence={confirmStartNewEventSequence}
          onPressAchievements={(pilot, model) =>
            achievementModalRef.current?.present(pilot, model)
          }
        />
      ) : (
        <SectionList
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior={'automatic'}
          stickySectionHeadersEnabled={true}
          style={[
            theme.styles.view,
            s.sectionList,
            modelsLayout === ModelsLayout.PostCards ? s.noPadding : {},
          ]}
          sections={groupModels(
            listModels === 'retired' ? retiredModels : activeModels,
          )}
          keyExtractor={item => item._id.toString()}
          renderItem={section =>
            modelsLayout === ModelsLayout.PostCards && listModels !== 'retired'
              ? renderModelPostCard(section)
              : renderModelListItem(section)
          }
          renderSectionHeader={({ section: { title } }) => (
            <SectionListHeader title={title} />
          )}
          ListFooterComponent={renderInactive()}
        />
      )}
      <AchievementModal ref={achievementModalRef} />
    </>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
    marginHorizontal: 10,
  },
  headerIconDisabled: {
    color: theme.colors.disabled,
  },
  noPadding: {
    paddingHorizontal: 0,
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ModelsScreen;
