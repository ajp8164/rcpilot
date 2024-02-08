import { AppTheme, useTheme } from 'theme';
import { DateRelation, EnumRelation, FilterState, ListItemFilterDate, ListItemFilterEnum, ListItemFilterNumber, ListItemFilterString, NumberRelation, StringRelation } from 'components/molecules/filters';
import { FilterType, MaintenanceReportFilterValues } from 'types/filter';
import { ListItem, ListItemInput } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { eqObject, eqString } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import { BSON } from 'realm';
import { Divider } from '@react-native-ajp-elements/ui';
import { Filter } from 'realmdb/Filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportFiltersNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useSetState } from '@react-native-ajp-elements/core';

const defaultFilter: MaintenanceReportFilterValues = {
  model: {relation: EnumRelation.Any, value: []},
  modelType: {relation: EnumRelation.Any, value: []},
  category: {relation: EnumRelation.Any, value: []},
  date: {relation: DateRelation.Any, value: []},
  costs: {relation: NumberRelation.Any, value: []},
  notes: {relation: StringRelation.Any, value: []},
};

const filterValueLabels: Record<string, string> = {
  costs: '$',
};

export type Props = NativeStackScreenProps<ReportFiltersNavigatorParamList, 'ReportMaintenanceFilterEditor'>;

const ReportMaintenanceFilterEditorScreen = ({ navigation, route }: Props) => {
  const { filterId, eventName } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const reportFilter = useObject(Filter, new BSON.ObjectId(filterId));

  const [name, setName] = useState(reportFilter?.name || undefined);
  const [values, setValues] = useSetState(reportFilter?.toJSON().values as MaintenanceReportFilterValues || defaultFilter);

  useEffect(() => {
    const canSave = !!name && (
      !eqString(reportFilter?.name, name) ||
      !eqObject(reportFilter?.values, values)
    );

    const save = () => {
      event.emit(eventName, reportFilter?._id.toString());

      if (reportFilter) {
        realm.write(() => {
          reportFilter.name = name!;
          reportFilter.type = FilterType.ReportMaintenanceFilter;
          reportFilter.values = values;
        });
      } else {
        realm.write(() => {
          realm.create('Filter', {
            name,
            type: FilterType.ReportMaintenanceFilter,
            values,
          });
        });
      }
    };  
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({visible: canSave, action: onDone});
  }, [ name, values ]);

  const onFilterValueChange = (property: keyof MaintenanceReportFilterValues, filterState: FilterState) => {
    // If there is a value label then add it to the filter state value as position [1].
    filterValueLabels[property] ? filterState.value[1] = filterValueLabels[property] : null;
    setValues({ [property]: filterState }, {assign: true});
  };

  const resetFilter = () => {
    setValues(defaultFilter, {assign: true});
  };

  const relationsAreDefault = () => {
    // Whether or not the set value relations are all set to the default value relations.
    let result = false;
    Object.keys(values).forEach(k => {
      result = result || 
        (values[k as keyof MaintenanceReportFilterValues].relation !==
          defaultFilter[k as keyof MaintenanceReportFilterValues].relation);
    });
    return !result;
  };

  return (
    <AvoidSoftInputView style={{ flex: 1 }}>
    <ScrollView style={theme.styles.view}>
      <Divider text={'FILTER NAME'}/>
      <ListItemInput
        value={name}
        placeholder={'Filter Name'}
        position={['first', 'last']}
        onChangeText={setName}
      /> 
      <Divider />
      <ListItem
        title={'Reset Filter'}
        titleStyle={s.reset}
        disabled={relationsAreDefault()}
        disabledStyle={s.resetDisabled}
        position={['first', 'last']}
        rightImage={false}
        onPress={resetFilter}
      />
      <Divider text={'This filter shows all the events that match all of these criteria.'}/>
      <ListItemFilterEnum
        title={'Model'}
        value={values.model.value}
        relation={values.model.relation}
        enumName={'Models'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('model', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Model Type'}
        value={values.modelType.value}
        relation={values.modelType.relation}
        enumName={'ModelTypes'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('modelType', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Category'}
        value={values.category.value}
        relation={values.category.relation}
        enumName={'Categories'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('category', filterState);
        }}
      />
      <Divider />
      <ListItemFilterDate
        title={'Date'}
        value={values.date.value}
        relation={values.date.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('date', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Costs'}
        value={values.costs.value}
        relation={values.costs.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('costs', filterState);
        }}
      />
      <Divider />
      <ListItemFilterString
        title={'Notes'}
        value={values.notes.value}
        relation={values.notes.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('notes', filterState);
        }}
      />
      <Divider />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>
    </AvoidSoftInputView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  reset: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderButtonText,
  },
  resetDisabled: {
    opacity: 0.3,
  }
}));

export default ReportMaintenanceFilterEditorScreen;
