import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import {
  ListItemFilterBoolean,
  ListItemFilterDate,
  ListItemFilterEnum,
  ListItemFilterNumber,
  ListItemFilterString,
} from 'components/molecules/filters';
import React, { useEffect } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { ModelFilterValues } from 'types/filter';
import { ModelFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import { defaultFilter } from 'lib/model';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useFilterEditor } from 'lib/useFilterEditor';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<ModelFiltersNavigatorParamList, 'ModelFilterEditor'>;

const ModelFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const setDebounced = useDebouncedRender();

  const filterEditor = useFilterEditor<ModelFilterValues>({
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
      <Divider text={'This filter shows all the models that match all of these criteria.'} />
      <ListItemFilterEnum
        title={'Model Type'}
        value={filterEditor.values.modelType.value}
        relation={filterEditor.values.modelType.relation}
        enumName={'ModelType'}
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
        enumName={'ModelCategory'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('category', filterState);
        }}
      />
      <Divider />
      <ListItemFilterDate
        title={'Last Event'}
        value={filterEditor.values.lastEvent.value}
        relation={filterEditor.values.lastEvent.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('lastEvent', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Total Time'}
        label={'h:mm'}
        value={filterEditor.values.totalTime.value}
        relation={filterEditor.values.totalTime.relation}
        numericProps={{ prefix: '', separator: ':' }}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('totalTime', filterState);
        }}
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Logs Batteries'}
        relation={filterEditor.values.logsBatteries.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('logsBatteries', filterState);
        }}
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Logs Fuel'}
        relation={filterEditor.values.logsFuel.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('logsFuel', filterState);
        }}
      />
      <Divider />
      <ListItemFilterBoolean
        title={'Damaged'}
        relation={filterEditor.values.damaged.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('damaged', filterState);
        }}
      />
      <Divider />
      <ListItemFilterString
        title={'Vendor'}
        value={filterEditor.values.vendor.value}
        relation={filterEditor.values.vendor.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('vendor', filterState);
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

export default ModelFilterEditorScreen;
