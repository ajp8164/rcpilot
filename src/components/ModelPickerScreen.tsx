import { AppTheme, useTheme } from 'theme';
import { Image, SectionList, SectionListData, SectionListRenderItem, View } from 'react-native';
import { ListItemCheckbox, SectionListHeader, listItemPosition } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { modelSummary, modelTypeIcons } from 'lib/model';

import { EmptyView } from 'components/molecules/EmptyView';
import { Model } from 'realmdb/Model';
import { MultipleNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SvgXml } from 'react-native-svg';
import { getColoredSvg } from '@react-native-ajp-elements/ui';
import { groupItems } from 'lib/sectionList';
import lodash from 'lodash';
import { makeStyles } from '@rn-vui/themed';
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
};

type Section = {
  title?: string;
  data: Model[];
};

export type Props = NativeStackScreenProps<MultipleNavigatorParamList, 'ModelPicker'>;

const ModelPickerScreen = ({ navigation, route }: Props) => {
  const { mode = 'one', title, selected, eventName } = route.params;
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const activeModels = useQuery(
    Model,
    models => {
      return models.filtered('retired == $0', false);
    },
    [],
  );

  const [list, setList] = useSetState<{ selected: Model[]; initial: Model[] }>({
    // Use an empty array if empty string is set.
    selected: lodash.isArrayLike(selected) ? selected : selected ? [selected] : [],
    initial: lodash.isArrayLike(selected) ? selected : selected ? [selected] : [],
  });

  useEffect(() => {
    navigation.setOptions({ title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelect = (model?: Model) => {
    let selected: Model[] = [];
    if (mode === 'one') {
      model ? (selected = [model]) : (selected = []);
      setList({ selected }, { assign: true });
    } else if (model) {
      if (list.selected.findIndex(s => s._id.toString() === model._id.toString()) > -1) {
        selected = list.selected.filter(s => s._id.toString() !== model._id.toString());
        setList({ selected }, { assign: true });
      } else {
        selected = list.selected.concat(model);
        setList({ selected: list.selected.concat(model) }, { assign: true });
      }
    }

    event.emit(eventName, { models: selected } as ModelPickerResult);
  };

  const groupModels = (models: Realm.Results<Model>): SectionListData<Model, Section>[] => {
    return groupItems<Model, Section>(models, model => {
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
        subtitle={modelSummary(model)}
        titleStyle={s.modelText}
        subtitleStyle={s.modelText}
        subtitleNumberOfLines={2}
        position={listItemPosition(index, section.data.length)}
        leftImage={
          <View style={s.modelIconContainer}>
            {model.image ? (
              <Image source={{ uri: model.image }} resizeMode={'cover'} style={s.modelImage} />
            ) : (
              <View style={s.modelSvgContainer}>
                <SvgXml
                  xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
                  width={s.modelImage.width}
                  height={s.modelImage.height}
                  color={theme.colors.brandSecondary}
                  style={s.modelIcon}
                />
              </View>
            )}
          </View>
        }
        checked={list.selected.findIndex(s => s._id.toString() === model._id.toString()) > -1}
        onPress={() => toggleSelect(model)}
      />
    );
  };

  if (!activeModels.length) {
    return (
      <EmptyView info message={'No Models'} details={'Add your first model on the Models tab.'} />
    );
  }

  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}
      stickySectionHeadersEnabled={true}
      style={[theme.styles.view, s.sectionList]}
      sections={groupModels(activeModels)}
      keyExtractor={item => item._id.toString()}
      renderItem={renderItem}
      renderSectionHeader={({ section: { title } }) => <SectionListHeader title={title} />}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
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
    left: 108,
    maxWidth: '60%',
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default ModelPickerScreen;
