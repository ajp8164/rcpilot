import { AppTheme, useTheme } from 'theme';
import { DateRelation, EnumRelation, FilterState, ListItemFilterDate, ListItemFilterEnum, ListItemFilterNumber, ListItemFilterString, NumberRelation, StringRelation } from 'components/molecules/filters';
import { FilterType, MaintenanceReportFilterValues } from 'types/filter';
import { ListItem, ListItemInput } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { eqObject, eqString } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { Filter } from 'realmdb/Filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportFiltersNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useSetState } from '@react-native-ajp-elements/core';

const defaultFilter: MaintenanceReportFilterValues = {
  model: {relation: EnumRelation.Any, value: []},
  modelType: {relation: EnumRelation.Any, value: []},
  category: {relation: EnumRelation.Any, value: []},
  date: {relation: DateRelation.Any, value: []},
  costs: {relation: NumberRelation.Any, value: []},
  notes: {relation: StringRelation.Any, value: []},
};

export type Props = NativeStackScreenProps<ReportFiltersNavigatorParamList, 'ReportMaintenanceFilterEditor'>;

const ReportMaintenanceFilterEditorScreen = ({ navigation, route }: Props) => {
  const { filterId, eventName } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const realm = useRealm();
  const reportFilter = useObject(Filter, new BSON.ObjectId(filterId));

  const [name, setName] = useState(reportFilter?.name || undefined);
  const [values, setValues] = useSetState(reportFilter?.toJSON().values as MaintenanceReportFilterValues || defaultFilter);

  const onFilterValueChange = (property: keyof MaintenanceReportFilterValues, value: FilterState) => {
    setValues({ [property]: value }, {assign: true});
  };

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

    navigation.setOptions({
      headerLeft: () => (
        <Button
          title={'Cancel'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
          onPress={navigation.goBack}
        />
      ),
      headerRight: () => {
        if (canSave) {
          return (
            <Button
              title={'Done'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.updateButton]}
              onPress={onDone}
            />
          )
        }
      },
    });
  }, [ name, values ]);  

  return (
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
        disabled={true}
        disabledStyle={s.resetDisabled}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => null}
      />
      <Divider text={'This filter shows all the events that match all of these criteria.'}/>
      <ListItemFilterEnum
        title={'Model'}
        value={values.model.value}
        relation={EnumRelation.Any}
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
        relation={EnumRelation.Any}
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
        relation={EnumRelation.Any}
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
        relation={DateRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('date', filterState);
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Costs'}
        label={''}
        value={values.costs.value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('costs', filterState);
        }}
      />
      <Divider />
      <ListItemFilterString
        title={'Notes'}
        value={values.notes.value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('notes', filterState);
        }}
      />
      <Divider />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  updateButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  reset: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton,
  },
  resetDisabled: {
    opacity: 0.3,
  }
}));

export default ReportMaintenanceFilterEditorScreen;
