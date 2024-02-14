import { AppTheme, useTheme } from 'theme';
import { ListItemCheckbox, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useRef } from 'react';
import { SectionList, SectionListData, SectionListRenderItem, View } from 'react-native';

import { BatteriesNavigatorParamList } from 'types/navigation';
import { Battery } from 'realmdb/Battery';
import { BatteryTemplate } from 'types/battery';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { groupItems } from 'lib/sectionList';
import { makeStyles } from '@rneui/themed';
import { useQuery } from '@realm/react';
import { useSetState } from '@react-native-ajp-elements/core';

type Section = {
  title?: string;
  data: Battery[];
  nameSuggestion: string;
};

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryTemplates'>;

const BatteryTemplatesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const allBatteries = useQuery(Battery);
  const templateCount = useRef(0);
  const templateRenderIndex = useRef(-1);

  const [list, setList] = useSetState<{ value?: BatteryTemplate; selected: number; initial: number; }>({
    value: undefined,
    selected: 0,
    initial: 0,
  });

  useEffect(() => {
    const onCreate = () => {
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('NewBatteryNavigator', {
          screen: 'NewBattery',
          params: {
            batteryTemplate: list.value,
          },
        });  
      });
    };

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            onPress={navigation.goBack}
          />
        )
      },
      headerRight: () => {
        return (
          <Button
            title={'Create'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            onPress={onCreate}
          />
        )
      },
    });
  }, [ list ]);

  const nameSuggestion = (battery: Battery) => {
    const matches =  battery.name.trim().split(/(\W|\w)(\d+)$/);
    const name = `${matches[0]}${matches[1] || ''}`;
    let number = matches[2];

    if (number) {
      number = (parseInt(number) + 1).toString();
    } else {
      number = '1';
    }
    return `${name}${number}`;
  };

  const groupBatteries = (batteries: Realm.Results<Battery>): SectionListData<Battery, Section>[] => {
    const sections = groupItems<Battery, Section>(batteries, (battery) => {
      const c = battery.capacity ? `${battery.capacity}mAh - ` : '';
      const p = battery.pCells > 1 ? `/${battery.pCells}P` : '';
      return `${c}${battery.sCells}S${p} PACKS`;
    }).sort();
    
    templateCount.current = sections.length;

    // Only need one item per group.
    const templates = sections.map(section => {
      // The section data is an array of the batteries in the section.
      // Use the first battery in the list to provide a new battery name suggestion.
      return {
        title: section.title,
        data: [section.data[0]],
        nameSuggestion: nameSuggestion(section.data[section.data.length - 1]),
      }
    });

    // Need to inialize the default value if not set (first execution).
    if (!list.value) {
      setSelected(0, templates[0].data[0], templates[0].nameSuggestion);
    }
    
    return templates;
  };

  const setSelected = (index: number, battery: Battery, nameSuggestion: string) => {
    const template: BatteryTemplate = {
      capacity: battery.capacity,
      chemistry: battery.chemistry,
      cRating: battery.cRating,
      name: nameSuggestion,
      pCells: battery.pCells,
      sCells: battery.sCells,
      tint: battery.tint,
      vendor: battery.vendor,
    };
    setList({ selected: index, value: template }, {assign: true});
  };

  const templateSummary = (battery: Battery) => {
    const capacity = `${battery.capacity}mAh`;
    const architecture = `${battery.sCells}S/${battery.pCells}P`;
    const chemistry = `${battery.chemistry} Pack`;
    const cRating = battery.cRating ? `, ${battery.cRating}C` : '';
    return `${capacity} ${architecture} ${chemistry}${cRating}`;
  };

  const renderBatteryTemplate: SectionListRenderItem<Battery, Section> = ({
    item: battery,
    section,
    index: _index,
  }: {
    item: Battery;
    section: Section; 
    index: number;
  }) => {
    // Keep an index over all the sections for the list item position.
    templateRenderIndex.current + 1 === templateCount.current
      ? templateRenderIndex.current = 0
      : templateRenderIndex.current++;

    const index = templateRenderIndex.current;
    return (
      <ListItemCheckbox
        key={`${index}`}
        title={battery.vendor || 'Unknown Vendor'}
        subtitle={templateSummary(battery)}
        position={listItemPosition(index, templateCount.current)}
        checked={list.selected === index}
        onPress={() => setSelected(index, battery, section.nameSuggestion)}
      />
    )
  };

  return (
    <View style={theme.styles.view}>
      <SectionList
        stickySectionHeadersEnabled={true}
        style={s.sectionList}
        sections={groupBatteries(allBatteries)}
        keyExtractor={(_item, index )=> `${index}`}
        renderItem={renderBatteryTemplate}
        renderSectionHeader={() => <></>}
        ListHeaderComponent={<Divider />}
        ListFooterComponent={<Divider />}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default BatteryTemplatesScreen;
