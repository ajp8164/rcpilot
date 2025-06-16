import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import {
  ListItemFilterDate,
  ListItemFilterEnum,
  ListItemFilterNumber,
  ListItemFilterString,
} from 'components/molecules/filters';
import React, { useEffect } from 'react';
import { defaultFilter, eventKind } from 'lib/modelEvent';

import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { EventFilterValues } from 'types/filter';
import { EventFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import lodash from 'lodash';
import { makeStyles } from '@rn-vui/themed';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useFilterEditor } from 'lib/useFilterEditor';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<EventFiltersNavigatorParamList, 'EventFilterEditor'>;

const EventFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, modelType, requireFilterName } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const setDebounced = useDebouncedRender();

  const filterEditor = useFilterEditor<EventFilterValues>({
    filterId,
    filterType,
    defaultFilter,
    filterValueLabels,
    generalFilterName,
  });

  useEffect(() => {
    if (requireFilterName) {
      filterEditor.setCreateSavedFilter(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!filterEditor.filter) {
    return <EmptyView error message={'Filter Not Found!'} />;
  }

  return (
    <ScrollView style={theme.styles.view}>
      <Divider text={'FILTER NAME'} />
      {filterEditor.name === filterEditor.generalFilterName || requireFilterName ? (
        <ListItemSwitch
          title={'Create a Saved Filter'}
          position={filterEditor.createSavedFilter ? ['first'] : ['first', 'last']}
          value={filterEditor.createSavedFilter}
          disabled={requireFilterName}
          expanded={filterEditor.createSavedFilter}
          onValueChange={filterEditor.setCreateSavedFilter}
          ExpandableComponent={
            <ListItemInput
              value={filterEditor.customName}
              placeholder={'Filter Name'}
              position={['last']}
              onChangeText={value => setDebounced(() => filterEditor.setCustomName(value))}
            />
          }
        />
      ) : (
        <ListItemInput
          value={filterEditor.name}
          placeholder={'Filter Name'}
          position={['first', 'last']}
          onChangeText={value => setDebounced(() => filterEditor.setName(value))}
        />
      )}
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
      <Divider
        text={`This filter shows all the ${eventKind(modelType).namePlural.toLowerCase()} that match all of these criteria.`}
      />
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
        numericProps={{ prefix: '', separator: ':' }}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('duration', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Style'}
        value={filterEditor.values.eventStyle.value}
        relation={filterEditor.values.eventStyle.relation}
        enumName={'EventStyle'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('eventStyle', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Battery'}
        value={filterEditor.values.battery.value}
        relation={filterEditor.values.battery.relation}
        enumName={'Battery'}
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
        enumName={'Location'}
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
        enumName={'Pilot'}
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
        enumName={'EventOutcome'}
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
      <Divider style={{ height: theme.insets.bottom }} />
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
  },
}));

export default EventFilterEditorScreen;
