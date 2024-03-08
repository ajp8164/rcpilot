import { AppTheme, useTheme } from 'theme';
import { EventFilterValues, FilterType } from 'types/filter';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import {
  ListItemFilterDate,
  ListItemFilterEnum,
  ListItemFilterNumber,
  ListItemFilterString,
} from 'components/molecules/filters';

import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { EventFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView } from 'react-native';
import { defaultFilter } from 'lib/modelEvent';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useFilterEditor } from 'lib/useFilterEditor';

export const generalEventsFilterName = 'general-events-filter';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<EventFiltersNavigatorParamList, 'EventFilterEditor'>;

const EventFilterEditorScreen = ({ route }: Props) => {
  const { filterId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const filterEditor = useFilterEditor<EventFilterValues>({
    filterId,
    filterType: FilterType.EventsFilter,
    defaultFilter,
    filterValueLabels,
    generalFilterName: generalEventsFilterName,
  });

  if (!filterEditor.filter) {
    return (
      <EmptyView error message={'Filter Not Found!'} />
    );
  }

  return (
    <ScrollView style={theme.styles.view}>
      <Divider text={'FILTER NAME'}/>
      {filterEditor.name === filterEditor.generalFilterName ?
        <ListItemSwitch
          title={'Create a Saved Filter'}
          position={filterEditor.createSavedFilter ? ['first'] : ['first', 'last']}
          value={filterEditor.createSavedFilter}
          expanded={filterEditor.createSavedFilter}
          onValueChange={filterEditor.setCreateSavedFilter}
          ExpandableComponent={
            <ListItemInput
              value={filterEditor.customName}
              placeholder={'Filter Name'}
              position={['last']}
              onChangeText={filterEditor.setCustomName}
            />
          }
        />
      :
        <ListItemInput
          value={filterEditor.name}
          placeholder={'Filter Name'}
          position={['first', 'last']}
          onChangeText={filterEditor.setName}
        />
      }
      <Divider />
      <ListItem
        title={'Reset Filter'}
        titleStyle={s.reset}
        disabled={lodash.isEqual(filterEditor.values, defaultFilter)}
        disabledStyle={s.resetDisabled}
        position={['first', 'last']}
        rightImage={false}
        onPress={filterEditor.resetFilter}
      />
      <Divider text={'This filter shows all the events that match all of these criteria.'}/>
      <ListItemFilterDate
        title={'Date'}
        value={filterEditor.values.date.value}
        relation={filterEditor.values.date.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('date', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Duration'}
        label={'m:ss'}
        value={filterEditor.values.duration.value}
        relation={filterEditor.values.duration.relation}
        numericProps={{prefix: '', separator: ':'}}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('duration', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Style'}
        value={filterEditor.values.style.value}
        relation={filterEditor.values.style.relation}
        enumName={'EventStyles'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('style', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Battery'}
        value={filterEditor.values.battery.value}
        relation={filterEditor.values.battery.relation}
        enumName={'Batteries'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('battery', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Location'}
        value={filterEditor.values.location.value}
        relation={filterEditor.values.location.relation}
        enumName={'Locations'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('location', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Pilot'}
        value={filterEditor.values.pilot.value}
        relation={filterEditor.values.pilot.relation}
        enumName={'Pilots'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('pilot', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Outcome'}
        value={filterEditor.values.outcome.value}
        relation={filterEditor.values.outcome.relation}
        enumName={'Outcomes'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('outcome', filterState);
        }}
      />
      <Divider />
      <ListItemFilterString
        title={'Notes'}
        value={filterEditor.values.notes.value}
        relation={filterEditor.values.notes.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('notes', filterState);
        }}
      />
      <Divider style={{height: theme.insets.bottom}} />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  reset: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.clearButtonText,
  },
  resetDisabled: {
    opacity: 0.3,
  }
}));

export default EventFilterEditorScreen;
