import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import {
  ListItemFilterEnum,
  ListItemFilterNumber,
} from 'components/molecules/filters';
import React, { useEffect } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportBatteryScanCodeFilterValues } from 'types/filter';
import { ReportBatteryScanCodeFiltersNavigatorParamList } from 'types/navigation';
import { ScrollView } from 'react-native';
import { defaultFilter } from 'lib/reports/reportBatteryScanCode';
import lodash from 'lodash';
import { makeStyles } from '@rn-vui/themed';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useFilterEditor } from 'lib/useFilterEditor';

const filterValueLabels: Record<string, string> = {};

export type Props = NativeStackScreenProps<
  ReportBatteryScanCodeFiltersNavigatorParamList,
  'ReportBatteryScanCodeFilterEditor'
>;

const ReportBatteryScanCodeFilterEditorScreen = ({ route }: Props) => {
  const { filterId, filterType, generalFilterName, requireFilterName } =
    route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const setDebounced = useDebouncedRender();

  const filterEditor = useFilterEditor<ReportBatteryScanCodeFilterValues>({
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
      {filterEditor.name === filterEditor.generalFilterName ||
      requireFilterName ? (
        <ListItemSwitch
          title={'Create a Saved Filter'}
          position={
            filterEditor.createSavedFilter ? ['first'] : ['first', 'last']
          }
          value={filterEditor.createSavedFilter}
          disabled={requireFilterName}
          expanded={filterEditor.createSavedFilter}
          onValueChange={filterEditor.setCreateSavedFilter}
          ExpandableComponent={
            <ListItemInput
              value={filterEditor.customName}
              placeholder={'Filter Name'}
              position={['last']}
              onChangeText={value =>
                setDebounced(() => filterEditor.setCustomName(value))
              }
            />
          }
        />
      ) : (
        <ListItemInput
          value={filterEditor.name}
          placeholder={'Filter Name'}
          position={['first', 'last']}
          onChangeText={value =>
            setDebounced(() => filterEditor.setName(value))
          }
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
        text={`This filter shows all the batteries that match all of these criteria.`}
      />
      <ListItemFilterEnum
        title={'Chemistry'}
        value={filterEditor.values.chemistry.value}
        relation={filterEditor.values.chemistry.relation}
        enumName={'BatteryChemistry'}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('chemistry', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Capacity'}
        label={'mAh'}
        value={filterEditor.values.capacity.value}
        relation={filterEditor.values.capacity.relation}
        numericProps={{ prefix: '', separator: ':' }}
        position={['first', 'last']}
        onValueChange={filterState => {
          filterEditor.onFilterValueChange('capacity', filterState);
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

export default ReportBatteryScanCodeFilterEditorScreen;
