import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import {
  ListItemFilterDate,
  ListItemFilterEnum,
  ListItemFilterNumber,
} from 'components/molecules/filters';
import React, { useEffect } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportEventFilterValues } from 'types/filter';
import { ReportEventFiltersNavigatorParamList } from 'types/navigation';
import { ScrollView } from 'react-native';
import { defaultFilter } from 'lib/reportEvents';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useFilterEditor } from 'lib/useFilterEditor';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  ReportEventFiltersNavigatorParamList,
  'ReportEventFilterEditor'
>;

const ReportEventFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);

  const filterEditor = useFilterEditor<ReportEventFilterValues>({
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
              onChangeText={filterEditor.setCustomName}
            />
          }
        />
      ) : (
        <ListItemInput
          value={filterEditor.name}
          placeholder={'Filter Name'}
          position={['first', 'last']}
          onChangeText={filterEditor.setName}
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
      <Divider text={`This filter shows all the events that match all of these criteria.`} />
      <ListItemFilterEnum
        title={'Model'}
        value={filterEditor.values.model.value}
        relation={filterEditor.values.model.relation}
        enumName={'Models'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('model', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Model Type'}
        value={filterEditor.values.modelType.value}
        relation={filterEditor.values.modelType.relation}
        enumName={'ModelTypes'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('modelType', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Category'}
        value={filterEditor.values.category.value}
        relation={filterEditor.values.category.relation}
        enumName={'Categories'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('category', filterState);
        }}
      />
      <Divider />
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
        title={'Outcome'}
        value={filterEditor.values.outcome.value}
        relation={filterEditor.values.outcome.relation}
        enumName={'Outcomes'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('outcome', filterState);
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

export default ReportEventFilterEditorScreen;
