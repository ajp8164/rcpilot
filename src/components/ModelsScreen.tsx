import { AppTheme, useTheme } from 'theme';
import { Divider, getColoredSvg, useListEditor } from '@react-native-ajp-elements/ui';
import { Image, SectionList, SectionListData, SectionListRenderItem, View } from 'react-native';
import { ListItem, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { modelShortSummary, modelTypeIcons } from 'lib/model';
import { useObject, useQuery, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { SvgXml } from 'react-native-svg';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useSelector } from 'react-redux';

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
  const realm = useRealm();

  const _pilot = useSelector(selectPilot);

  const activeModels = useQuery(Model, models => { return models.filtered('retired == $0', false) }, []);
  const retiredModels = useQuery(Model, models => { return models.filtered('retired == $0', true) }, []);
  const pilot = useObject(Pilot, new BSON.ObjectId(_pilot.pilotId));

  useEffect(() => {  
    navigation.setOptions({
      headerLeft: () => {
        if (listModels === 'all') {
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
  }, [ activeModels, retiredModels, listEditor.enabled ]);

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
      return model.type.toUpperCase();
    }).sort();

    if (pilot && pilot.favoriteModels.length > 0) {
      groups.splice(0, 0, {
        title: `FAVORITES MODELS FOR ${pilot.name.toUpperCase()}`,
        data: pilot.favoriteModels,
      });
    }
    return groups;
  };

  const renderModel: SectionListRenderItem<Model, Section> = ({
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
          </View>
        }
        onPress={() => {
          if (listModels !== 'all') {
            navigation.navigate('ModelEditor', {
              modelId: model._id.toString(),
            });
          } else {
            navigation.navigate('FlightNavigator', {
              modelId: model._id.toString(),
            });
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
              const label = listModels === 'retired' ? 'Delete Retired Model' : 'Delete Model'
              confirmAction(label, model, deleteModel);
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

  if (!activeModels.length && !retiredModels.length) {
    return (
      <EmptyView info message={'No Models'} details={"Tap the + button to add your first model."} />
    );    
  }

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={groupModels(listModels === 'retired' ? retiredModels : activeModels)}
      keyExtractor={item => item._id.toString()}
      renderItem={renderModel}
      renderSectionHeader={({section: {title}}) => (
        <Divider text={title} />
      )}
      ListFooterComponent={renderInactive()}
    />
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
  modelIcon: {
    transform: [{rotate: '-45deg'}],
  },
  modelIconContainer: {
    position: 'absolute',
    left: -15,
  },
  modelImage: {
    width: 150,
    height: 85
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
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
