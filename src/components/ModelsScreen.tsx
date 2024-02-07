import { AppTheme, useTheme } from 'theme';
import { Pressable, SectionList, SectionListData, SectionListRenderItem, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useObject, useQuery, useRealm } from '@realm/react';

import { ActionSheet } from 'react-native-ui-lib';
import { Button } from '@rneui/base';
import { Divider, getColoredSvg } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { modelTypeIcons } from 'lib/model';
import { useSelector } from 'react-redux';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { Pilot } from 'realmdb/Pilot';
import { BSON } from 'realm';
import { SvgXml } from 'react-native-svg';

type Section = {
  title?: string;
  data: Model[];
};

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'Models'>;

const ModelsScreen = ({ navigation, route }: Props) => {
  const { listModels } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const realm = useRealm();

  const _pilot = useSelector(selectPilot);

  const activeModels = useQuery(Model, models => { return models.filtered('retired == $0', false) }, []);
  const retiredModels = useQuery(Model, models => { return models.filtered('retired == $0', true) }, []);
  const pilot = useObject(Pilot, new BSON.ObjectId(_pilot.pilotId));

  const [listEditModeEnabled, setListEditModeEnabled] = useState(false);
  const [deleteModelActionSheetVisible, setDeleteModelActionSheetVisible] = useState<Model>();

  useEffect(() => {  
    const onEdit = () => {
      setListEditModeEnabled(!listEditModeEnabled);
    };

    navigation.setOptions({
      headerLeft: () => {
        if (listModels === 'all') {
          return (
            <Button
              title={listEditModeEnabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.editButton]}
              disabled={!activeModels.length}
              disabledStyle={theme.styles.buttonClearDisabled}
              onPress={onEdit}
            />
          );
        } else {
          return null;
        }
      },
      headerRight: ()  => {
        return (
          <>
            <Pressable
              disabled={listEditModeEnabled}
              onPress={() => navigation.navigate('ModelFiltersNavigator')}>
              <Icon
                name={'filter'}
                style={[
                  s.headerIcon,
                  listEditModeEnabled ? s.headerIconDisabled : {}
                ]}
              />
            </Pressable>
            {listModels !== 'all' ?
              <Button
                title={listEditModeEnabled ? 'Done' : 'Edit'}
                titleStyle={theme.styles.buttonClearTitle}
                buttonStyle={[theme.styles.buttonClear, s.editButton]}
                onPress={onEdit}
              />
            :
              <Pressable
                disabled={listEditModeEnabled}
                onPress={() => navigation.navigate('NewModelNavigator', {
                  screen: 'NewModel',
                  params: {}
                })}>
                <Icon
                  name={'plus'}
                  style={[
                    s.headerIcon,
                    listEditModeEnabled ? s.headerIconDisabled : {}
                  ]}
                />
              </Pressable>
            }
          </>
        );
      },
    });
  }, [ listEditModeEnabled ]);

  const confirmDeleteModel = (model: Model) => {
    setDeleteModelActionSheetVisible(model);
  };

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
        key={model._id.toString()}
        title={model.name}
        subtitle={'1 flight, last Nov 4, 2023\n0:04:00 total time, 4:00 avg time'}
        titleStyle={s.modelText}
        subtitleStyle={s.modelText}
        position={section.data.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === section.data.length - 1 ? ['last'] : []}
        leftImage={
          <View style={s.modelIconContainer}>
            <SvgXml
              xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
              width={75}
              height={75}
              color={theme.colors.brandPrimary}
              style={s.modelIcon}
            />
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
            icon: 'delete',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => confirmDeleteModel(model),
          }]
        }}
     />
    )
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={theme.styles.view}>
      <SectionList
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        style={s.sectionList}
        sections={groupModels(listModels === 'retired' ? retiredModels : activeModels)}
        keyExtractor={item => item._id.toString()}
        renderItem={renderModel}
        renderSectionHeader={({section: {title}}) => (
          <Divider text={title} />
        )}
        ListEmptyComponent={
          !retiredModels.length ?
            <Text style={s.emptyList}>{'No Models'}</Text>
            : null
        }
        ListFooterComponent={
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
        }
      />
      <ActionSheet
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        options={[
          {
            label: listModels === 'retired' ? 'Delete Retired Model' : 'Delete Model',
            onPress: () => {
              deleteModel(deleteModelActionSheetVisible!);
              setDeleteModelActionSheetVisible(undefined);
            },
          },
          {
            label: 'Cancel' ,
            onPress: () => setDeleteModelActionSheetVisible(undefined),
          },
        ]}
        useNativeIOS={true}
        visible={!!deleteModelActionSheetVisible}
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  editButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 180,
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
  },
  headerIcon: {
    color: theme.colors.brandPrimary,
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
  modelText: {
    left: 48,
    maxWidth: '90%',
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ModelsScreen;
