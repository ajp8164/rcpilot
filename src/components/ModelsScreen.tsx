import { AppTheme, useTheme } from 'theme';
import { Pressable, SectionList, SectionListData, SectionListRenderItem, Text } from 'react-native';
import React, { useEffect, useState } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { useQuery } from '@realm/react';

type Section = {
  title?: string;
  data: Model[];
};

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'Models'>;

const ModelsScreen = ({ navigation, route }: Props) => {
  const { inactiveOnly } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const activeModels = useQuery(
    Model,
    models => { return models.filtered('retired == $0', false) },
    [],
  );

  const inactiveModels = useQuery(
    Model,
    models => { return models.filtered('retired == $0', true) },
    [],
  );

  const [groupedModels, setGroupedModels] = useState<SectionListData<Model, Section>[]>([]);
  const [editModeEnabled, setEditModeEnabled] = useState(false);

  useEffect(() => {
    setGroupedModels(groupModels(inactiveOnly ? inactiveModels : activeModels));
  }, [ activeModels, inactiveModels ]);

  useEffect(() => {
    if (inactiveOnly) {
      // Clear param for next navigation to this screen.
      navigation.setParams({});
    }
  
    const onEdit = () => {
      setEditModeEnabled(!editModeEnabled);
    };

    navigation.setOptions({
      headerLeft: () => {
        if (inactiveOnly) {
          return null;
        } else {
          return (
            <Button
              title={editModeEnabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.editButton]}
              onPress={onEdit}
            />
          )
        }
      },
      headerRight: ()  => {
        return (
          <>
            <Pressable
              disabled={editModeEnabled}
              onPress={() => navigation.navigate('ModelFiltersNavigator')}>
              <Icon
                name={'filter'}
                style={[
                  s.headerIcon,
                  editModeEnabled ? s.headerIconDisabled : {}
                ]}
              />
            </Pressable>
            <Pressable
              disabled={editModeEnabled}
              onPress={() => navigation.navigate('NewModelNavigator', {
                screen: 'NewModel',
                params: {}
              })}>
              <Icon
                name={'plus'}
                style={[
                  s.headerIcon,
                  editModeEnabled ? s.headerIconDisabled : {}
                ]}
              />
            </Pressable>
          </>
        );
      },
    });
  }, [ editModeEnabled ]);

  const deleteModel = (index: number) => {
    if (activeModels[index]) {
      const m = [...activeModels];
      m.splice(index, 1);
    }
  };

  const groupModels = (models: Realm.Results<Model>): SectionListData<Model, Section>[] => {
    return groupItems<Model, Section>(models, (model) => {
      if (model.category) {
        return `${model.type.toUpperCase()} - ${model.category.name.toUpperCase()}`;
      }
      return model.type.toUpperCase();
    }).sort();
  };

  const renderItem: SectionListRenderItem<Model, Section> = ({
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
        subtitle={'1 flight, last Nov 4, 2023\n0:04:00 total time, 4:00 average time'}
        position={section.data.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === section.data.length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('FlightNavigator', {
          modelId: model._id.toString(),
        })}
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
        showEditor={editModeEnabled}
        swipeable={{
          rightItems: [{
            icon: 'delete',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => deleteModel(index),
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
        sections={groupedModels}
        keyExtractor={item => item._id.toString()}
        renderItem={renderItem}
        renderSectionHeader={({section: {title}}) => (
          <Divider text={title} />
        )}
        ListEmptyComponent={
          <Text style={s.emptyList}>{'No Models'}</Text>
        }
        ListFooterComponent={
          <>
          {!inactiveOnly && inactiveModels.length
            ?
              <>
                <Divider text={'INACTIVE MODELS'} />
                <ListItem
                  title={'Retired'}
                  value={`${inactiveModels.length}`}
                  position={['first', 'last']}
                  onPress={() => navigation.push('Models', {
                    inactiveOnly: true,
                  })}
                />
                <Divider />
              </>
            :
              <Divider />
          }
          </>
        }
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
  },
  headerIcon: {
    color: theme.colors.brandPrimary,
    fontSize: 22,
    marginHorizontal: 10,
  },
  headerIconDisabled: {
    color: theme.colors.disabled,
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
  sectionHeaderContainer: {
    height: 35,
    paddingTop: 12,
    paddingHorizontal: 25,
    backgroundColor: theme.colors.listHeaderBackground,
  },
}));

export default ModelsScreen;
