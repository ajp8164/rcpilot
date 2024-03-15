import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import {
  ListItemFilterDate,
  ListItemFilterNumber,
  ListItemFilterString,
} from 'components/molecules/filters';
import React, { useEffect } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { ModelMaintenanceFilterValues } from 'types/filter';
import { ModelMaintenanceFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import { defaultFilter } from 'lib/maintenance';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useFilterEditor } from 'lib/useFilterEditor';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<ModelMaintenanceFiltersNavigatorParamList, 'ModelMaintenanceFilterEditor'>;

const MaintenanceFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const filterEditor = useFilterEditor<ModelMaintenanceFilterValues>({
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
  }, []);

  if (!filterEditor.filter) {
    return (
      <EmptyView error message={'Filter Not Found!'} />
    );
  }

  return (
    <ScrollView style={theme.styles.view}>
      <Divider text={'FILTER NAME'}/>
      {filterEditor.name === filterEditor.generalFilterName || requireFilterName ?
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
      <Divider text={'This filter shows all the logs that match all of these criteria.'}/>
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
        title={'Costs'}
        value={filterEditor.values.costs.value}
        relation={filterEditor.values.costs.relation}
        numericProps={{maxValue: 99999}}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('costs', filterState);
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

export default MaintenanceFilterEditorScreen;
