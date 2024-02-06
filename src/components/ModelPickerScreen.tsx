import { AppTheme, useTheme } from 'theme';
import React, { useEffect } from 'react';
import { SectionList, SectionListData, SectionListRenderItem, Text, View } from 'react-native';

import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItemCheckbox } from 'components/atoms/List';
import { Model } from 'realmdb/Model';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupItems } from 'lib/sectionList';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { modelTypeIcons } from 'lib/model';
import { useEvent } from 'lib/event';
import { useQuery } from '@realm/react';
import { useSetState } from '@react-native-ajp-elements/core';

export type ModelPickerInterface = {
  mode?: 'one' | 'many';
  title: string;
  selected?: Model | Model[]; // The literal value(s)
  eventName: string;
};

export type ModelPickerResult = {
  models: Model[];
}

type Section = {
  title?: string;
  data: Model[];
};

export type Props = NativeStackScreenProps<MultipleNavigatorParamList, 'ModelPicker'>;

const ModelPickerScreen = ({ navigation, route }: Props) => {
  const {
    mode = 'one',
    title,
    selected,
    eventName,
  } = route.params;
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const activeModels = useQuery(Model, models => { return models.filtered('retired == $0', false) }, []);

  const [list, setList] = useSetState<{ selected: Model[]; initial: Model[]; }>({
     // Use an empty array if empty string is set.
    selected: lodash.isArrayLike(selected) ? selected : selected ? [selected] : [],
    initial: lodash.isArrayLike(selected) ? selected : selected ? [selected] : [],
  });

  useEffect(() => {
    navigation.setOptions({ title });
  }, []);

  const toggleSelect = (model?: Model) => {
    let selected: Model[] = [];
    if (mode === 'one') {
      model ? selected = [model] : selected = [];
      setList({ selected }, {assign: true});
    } else if (model) {
      if (list.selected.findIndex(s => s._id.toString() === model._id.toString()) > -1) {
        selected = list.selected.filter(s => s._id.toString() !== model._id.toString());
        setList({ selected }, {assign: true});
      } else {
        selected = list.selected.concat(model);
        setList({ selected: list.selected.concat(model) }, {assign: true});
      }
    }

    event.emit(eventName, {models: selected} as ModelPickerResult);
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
      <ListItemCheckbox
        key={model._id.toString()}
        title={model.name}
        subtitle={'1 flight, last Nov 4, 2023\n0:04:00 total time, 4:00 avg time'}
        titleStyle={s.modelText}
        subtitleStyle={s.modelText}
        position={section.data.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === section.data.length - 1 ? ['last'] : []}
        leftImage={
          <View>
            <Icon
              name={modelTypeIcons[model.type]?.name as string}
              size={45}
              color={modelTypeIcons[model.type]?.color}
              style={s.modelIcon}
            />
          </View>
        }
        checked={list.selected.findIndex(s => s._id.toString() === model._id.toString()) > -1}
        onPress={() => toggleSelect(model)}
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
        sections={groupModels(activeModels)}
        keyExtractor={item => item._id.toString()}
        renderItem={renderItem}
        renderSectionHeader={({section: {title}}) => (
          <Divider text={title} />
        )}
        ListEmptyComponent={
          <Text style={s.emptyList}>{'No Models'}</Text>
        }
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  emptyList: {
    textAlign: 'center',
    marginTop: 180,
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
  },
  modelIcon: {
    width: '100%',
  },
  modelText: {
    left: 23,
    maxWidth: '90%',
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ModelPickerScreen;
