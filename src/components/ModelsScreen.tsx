import { Alert, Image, SectionList, SectionListData, SectionListRenderItem, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import { Divider, getColoredSvg, useListEditor } from '@react-native-ajp-elements/ui';
import { ListItem, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect, useRef } from 'react';
import { modelChecklistActionsPending, modelShortSummary, modelTypeIcons } from 'lib/model';
import { useDispatch, useSelector } from 'react-redux';
import { useObject, useQuery, useRealm } from '@realm/react';

import { AchievementModal } from 'components/modals/AchievementModal';
import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { ChecklistType } from 'types/checklist';
import CustomIcon from "theme/icomoon/CustomIcon";
import { DateTime } from 'luxon';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { SvgXml } from 'react-native-svg';
import { eventKind } from 'lib/event';
import { eventSequence } from 'store/slices/eventSequence';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { selectAppSettings } from 'store/selectors/appSettingsSelectors';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';

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
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const _pilot = useSelector(selectPilot);
  const appSettings = useSelector(selectAppSettings);

  const activeModels = useQuery(Model, models => { return models.filtered('retired == $0', false) }, []);
  const retiredModels = useQuery(Model, models => { return models.filtered('retired == $0', true) }, []);
  const pilot = useObject(Pilot, new BSON.ObjectId(_pilot.pilotId));

  const achievementModalRef = useRef<AchievementModal>(null);

  useEffect(() => {  
    navigation.setOptions({
      headerLeft: () => {
        if (listModels === 'all' && !appSettings.showModelCards) {
          return (
            <Button
              title={listEditor.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
              disabled={!activeModels.length}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              onPress={listEditor.onEdit}
            />
          );
        } else {
          return null;
        }
      },
      headerRight: ()  => {
        return (
          <>
            <Button
              buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={listEditor.enabled || 
                (listModels === 'all' && !activeModels.length) ||
                (listModels !== 'all' && !retiredModels.length)}
              icon={
                <Icon
                  name={'filter'}
                  style={[s.headerIcon,
                    listEditor.enabled ||
                    (listModels === 'all' && !activeModels.length) ||
                    (listModels !== 'all' && !retiredModels.length)
                    ? s.headerIconDisabled : {}
                  ]}
                />
              }
              onPress={() => navigation.navigate('ModelFiltersNavigator', {
                screen: 'ModelFilters',
              })}
            />
            {listModels !== 'all' ?
              <Button
                title={listEditor.enabled ? 'Done' : 'Edit'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
                disabled={!retiredModels.length}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                onPress={listEditor.onEdit}
              />
            :
              <Button
                buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
                disabledStyle={theme.styles.buttonScreenHeaderDisabled}
                disabled={listEditor.enabled}
                icon={
                  <Icon
                    name={'plus'}
                    style={[s.headerIcon, listEditor.enabled ? s.headerIconDisabled : {}]}
                  />
                }
                onPress={() => navigation.navigate('NewModelNavigator', {
                  screen: 'NewModel',
                  params: {}
                })}
              />
            }
          </>
        );
      },
    });
  }, [ activeModels, retiredModels, listEditor.enabled, appSettings ]);

  const deleteModel = (model: Model) => {
    realm.write(() => {
      realm.delete(model);
    });
  };

  const groupModels = (models: Realm.Results<Model>): SectionListData<Model, Section>[] => {
    const groups = groupItems<Model, Section>(models, (model) => {
      if (model.category) {
        return `${model.type.toUpperCase()} - ${model.category.name.toUpperCase()}`;
      }
      return `${model.type.toUpperCase()}S`;
    }).sort();

    if (pilot && pilot.favoriteModels.length > 0) {
      groups.splice(0, 0, {
        title: `FAVORITES MODELS FOR ${pilot.name.toUpperCase()}`,
        data: pilot.favoriteModels,
      });
    }
    return groups;
  };

  const confirmStartNewEventSequence= (model: Model) => {
    const maintenancePending = modelChecklistActionsPending(model, ChecklistType.Maintenance).length > 0;
    if (maintenancePending) {
      Alert.alert(
        'Maintenance Due',
        `This ${model.type.toLowerCase()} has one or more maintenance actions due.\n\nAre you sure you want to use it for this ${eventKind(model.type).name.toLowerCase()}?`,
        [
          { text: 'Yes', onPress: () => startNewEventSequence(model)},
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: false },
      );
    } else if (model.damaged) {
      Alert.alert(
        `Damaged ${model.type}`,
        `This ${model.type.toLowerCase()} is marked as damaged.\n\nAre you sure you want to use it for this ${eventKind(model.type).name.toLowerCase()}?`,
        [
          { text: 'Yes', onPress: () => startNewEventSequence(model)},
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: false },
      );
    } else {
      startNewEventSequence(model);
    }
  };

  const startNewEventSequence= (model: Model) => {
    dispatch(eventSequence.reset());
    dispatch(eventSequence.setModel({modelId: model._id.toString()}));

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

  const renderModelCard: SectionListRenderItem<Model, Section> = ({
    item: model,
    section: _model,
    index: _index,
  }: {
    item: Model;
    section: Section;
    index: number;
  }) => {
    return (
    <View style={s.modelCard}>
      <View style={s.modelCardHeader}>
        {pilot &&
          <Button
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton, {borderWidth: 0}]}
            icon={
              <Icon
                name={'certificate'}
                color={theme.colors.subtleGray}
                size={30}
                style={{ top: -2, height: 30,}}
              />
            }
            titleStyle={[theme.styles.textTiny,theme.styles.textBold,{marginLeft: -30, color: theme.colors.lightGray, top: -2, marginRight: 10, borderWidth: 0, width: 30}]}
            title={pilot ? `${pilot.achievements.length}` : '0'}
            onPress={() => achievementModalRef.current?.present(pilot, model)}
          />
        }
        <View style={{flex: 1}}>
          <View style={s.modelCardTitleContainer}>
            <Text style={s.modelCardTitleLeft}>
              {model.name}
            </Text>
            <Text style={s.modelCardTitleRight}>
              {model.lastEvent
                ? `Last ${DateTime.fromISO(model.lastEvent).toFormat('mm/dd/yyyy')}`
                : `No ${eventKind(model.type).namePlural}`}
            </Text>
          </View>
          <View style={s.modelCardSubtitleContainer}>
            <Text style={s.modelCardSubtitle}>
              {`${model.totalEvents || 0} events`}
            </Text>
            <Text style={s.modelCardSubtitle}>
              {`${model.totalTime} total time`}
            </Text>
          </View>
        </View>
      </View>
      {model.image ?
        <Image
          source={{ uri: model.image }}
          resizeMode={'cover'}
          style={s.modelCardImage}
        />
      :
        <View style={s.modelCardSvg}>
          <SvgXml
            xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
            width={s.modelImage.width}
            height={'100%'}
            color={theme.colors.brandSecondary}
            style={s.modelIcon}
          />
        </View>
      }
      {(model.damaged || model.requiresMaintenance) &&
        <View style={s.modelTagContainer}>
          {model.damaged && <Text style={s.modelTag}>{'Damaged'}</Text>}
          {model.requiresMaintenance && <Text style={s.modelTag}>{'Maintenance Due'}</Text>}
        </View>
      }
      <View style={s.modelCardFooter}>
        <Button
          title={'Details'}
          titleStyle={s.modelCardButtonTitle}
          buttonStyle={s.modelCardButton}
          icon={
            <CustomIcon
              name={'circle-info'}
              size={20}
              color={theme.colors.midGray}
              style={{ paddingRight: 5}}
            />
          }
          onPress={() => navigation.navigate('ModelEditor', {
            modelId: model._id.toString(),
          })}
        />
        <Button
          title={`New ${eventKind(model.type).name}`}
          titleStyle={s.modelCardButtonTitle}
          buttonStyle={s.modelCardButton}
          icon={
            <Icon
              name={'circle-play'}
              size={20}
              color={theme.colors.midGray}
              style={{ paddingRight: 5}}
            />
          }
          onPress={() => {
            if (listModels !== 'all') {
              navigation.navigate('ModelEditor', {
                modelId: model._id.toString(),
              });
            } else {
              confirmStartNewEventSequence(model);
            }
          }}
        />
      </View>
    </View>
    )
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
      <ListItem
        ref={ref => ref && listEditor.add(ref, 'models', model._id.toString())}
        key={model._id.toString()}
        title={model.name}
        subtitle={modelShortSummary(model)}
        titleStyle={s.modelText}
        subtitleStyle={s.modelText}
        subtitleNumberOfLines={2}
        bottomDividerLeft={s.modelImage.width + 15}
        position={listItemPosition(index, section.data.length)}
        leftImage={
          <View style={s.modelIconContainer}>
            {model.image ?
              <Image
                source={{ uri: model.image }}
                resizeMode={'cover'}
                style={s.modelImage}
              />
            :
              <View style={s.modelSvgContainer}>
                <SvgXml
                  xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
                  width={s.modelImage.width}
                  height={s.modelImage.height}
                  color={theme.colors.brandSecondary}
                  style={s.modelIcon}
                />
              </View>
            }
            {(model.damaged || model.requiresMaintenance) &&
              <View style={s.modelStatusContainer}>
                {model.damaged &&
                  <Icon
                    name={'bandage'}
                    size={12}
                    color={theme.colors.stickyWhite}
                    style={s.modelStatusIcon}
                  />
                }
                {model.requiresMaintenance &&
                  <Icon
                    name={'wrench'}
                    size={10}
                    color={theme.colors.stickyWhite}
                    style={s.modelStatusIcon}
                  />
                }
              </View>
            }
          </View>
        }
        onPress={() => {
          if (listModels !== 'all') {
            navigation.navigate('ModelEditor', {
              modelId: model._id.toString(),
            });
          } else {
            confirmStartNewEventSequence(model);
          }
        }}
        showInfo={listModels === 'all'}
        onPressInfo={() => navigation.navigate('ModelEditor', {
          modelId: model._id.toString(),
        })}
        zeroEdgeContent={true}
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
          rightItems: [{
            ...swipeableDeleteItem[theme.mode],
            onPress: () => {
              const label = listModels === 'retired' ? `Delete Retired ${model.type}` : `Delete ${model.type}`;
              confirmAction(deleteModel, {
                label,
                title: `This action cannot be undone.\nAre you sure you want to delete this ${model.type.toLocaleLowerCase()}?`,
                value: model
              });
            },
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('models', model._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
     />
    )
  };

  const renderInactive = () => {
    return (
      listModels === 'all' && retiredModels.length ?
      <>
        <Divider text={'INACTIVE MODELS'} />
        <ListItem
          title={'Retired'}
          value={`${retiredModels.length}`}
          position={['first', 'last']}
          onPress={() => navigation.push('Models', {
            listModels: 'retired',
          })}
        />
        <Divider />
      </>
    :
      <Divider />
    );
  };

  if (listModels === 'retired' && !retiredModels.length) {
    return (
      <EmptyView info message={'No Retired Models'} />
    );
  }

  if (!activeModels.length && !retiredModels.length) {
    return (
      <EmptyView info message={'No Models'} details={"Tap the + button to add your first model."} />
    );    
  }

  return (
    <>
      <SectionList
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        style={[theme.styles.view, s.sectionList]}
        sections={groupModels(listModels === 'retired' ? retiredModels : activeModels)}
        keyExtractor={item => item._id.toString()}
        renderItem={section => appSettings.showModelCards && listModels !== 'retired'
          ? renderModelCard(section)
          : renderModelListItem(section)}
        renderSectionHeader={({section: {title}}) => (
          <Divider text={title} />
        )}
        ListFooterComponent={renderInactive()}
      />
      <AchievementModal ref={achievementModalRef} />
    </>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
    marginHorizontal: 10,
  },
  headerIconDisabled: {
    color: theme.colors.disabled,
  },
  modelCard: {
    width: '100%',
    paddingVertical: 10,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.colors.listItem,
  },
  modelCardHeader: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    paddingHorizontal: 15,
  },
  modelCardTitleLeft: {
    ...theme.styles.textNormal,
    ...theme.styles.textBold,
  },
  modelCardTitleRight: {
    ...theme.styles.textSmall,
    flex: 1,
    top: 2,
    textAlign: 'right',
  },
  modelCardTitleContainer: {
    flexDirection: 'row',
  },
  modelCardSubtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modelCardSubtitle: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim,
    paddingBottom: 5,
  },
  modelCardImage: {
    flex: 1,
    minHeight: 132,
  },
  modelCardSvg: {
    flex: 1,
    minHeight: 132,
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
  modelCardFooter: {
    flexDirection: 'row',
    height: 48,
    paddingTop: 10,
    paddingHorizontal: 15,
    justifyContent:'space-between',
    alignItems: 'center',
  },
  modelCardButtonTitle: {
    ...theme.styles.buttonScreenHeaderTitle,
    ...theme.styles.textSmall,
    ...theme.styles.textBold,
    color: theme.colors.midGray,
  },
  modelCardButton: {
    ...theme.styles.buttonScreenHeader,
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  modelIcon: {
    transform: [{rotate: '-45deg'}],
  },
  modelIconContainer: {
    position: 'absolute',
    left: -15,
    overflow:'hidden',
  },
  modelImage: {
    width: 150,
    height: 85,
  },
  modelStatusContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    height: 16,
    paddingTop: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.blackTransparentLight,
  },
  modelStatusIcon: {
    paddingHorizontal: 10,
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
  modelTagContainer: {
    flexDirection: 'row',
    padding: 5,
    paddingTop: 10,
    marginHorizontal: 10,
  },
  modelTag: {
    ...theme.styles.textTiny,
    ...theme.styles.textBold,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginRight: 5,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
    backgroundColor: theme.colors.lightGray, color: theme.colors.stickyWhite,
  },
  modelText: {
    left: 140,
    maxWidth: '48%',
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ModelsScreen;
