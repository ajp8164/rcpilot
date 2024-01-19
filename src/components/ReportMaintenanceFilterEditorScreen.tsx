import { AppTheme, useTheme } from 'theme';
import { DateRelation, EnumRelation, FilterState, ListItemFilterDate, ListItemFilterEnum, ListItemFilterNumber, ListItemFilterString, NumberRelation, StringRelation } from 'components/molecules/filters';
import { FilterType, MaintenanceReportFilterValue } from 'types/filter';
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

export type Props = NativeStackScreenProps<ReportFiltersNavigatorParamList, 'ReportMaintenanceFilterEditor'>;

const ReportMaintenanceFilterEditorScreen = ({ navigation, route }: Props) => {
  const { filterId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();
  const reportFilter = useObject(Filter, new BSON.ObjectId(filterId));

  const [name, setName] = useState(reportFilter?.name || undefined);
  const [values, setValues] = useState(reportFilter?.values || {});

  // const [values, setValues] = useSetState<MaintenanceReportFilterValues>({
  //   [MaintenanceReportFilterValue.Model]: {relation: EnumRelation.Any, value: ''},
  //   [MaintenanceReportFilterValue.ModelType]: {relation: EnumRelation.Any, value: ''},
  //   [MaintenanceReportFilterValue.Category]: {relation: EnumRelation.Any, value: ''},
  //   [MaintenanceReportFilterValue.Date]: {relation: DateRelation.Any, value: ''},
  //   [MaintenanceReportFilterValue.Costs]: {relation: NumberRelation.Any, value: ''},
  //   [MaintenanceReportFilterValue.Notes]: {relation: StringRelation.Any, value: ''},
  // });

  const onFilterValueChange = (property: MaintenanceReportFilterValue, value: FilterState) => {
    setValues({
      [property]: value,
    });
  };

  useEffect(() => {
    const canSave = !!name && (
      !eqString(reportFilter?.name, name) ||
      !eqObject(reportFilter?.values, values)
    );

    const save = () => {
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
              title={'Update'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.updateButton]}
              onPress={onDone}
            />
          )
        }
      },
    });
  }, []);  

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
        value={values[MaintenanceReportFilterValue.Model]?.value}
        relation={EnumRelation.Any}
        enumName={'Models'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(MaintenanceReportFilterValue.Model, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Model Type'}
        value={values[MaintenanceReportFilterValue.ModelType]?.value}
        relation={EnumRelation.Any}
        enumName={'ModelTypes'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(MaintenanceReportFilterValue.ModelType, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Category'}
        value={values[MaintenanceReportFilterValue.Category]?.value}
        relation={EnumRelation.Any}
        enumName={'Categories'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(MaintenanceReportFilterValue.Category, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterDate
        title={'Date'}
        value={values[MaintenanceReportFilterValue.Date]?.value}
        relation={DateRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(MaintenanceReportFilterValue.Date, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Costs'}
        label={''}
        value={values[MaintenanceReportFilterValue.Costs]?.value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(MaintenanceReportFilterValue.Costs, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterString
        title={'Notes'}
        value={values[MaintenanceReportFilterValue.Notes]?.value}
        relation={StringRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(MaintenanceReportFilterValue.Costs, {relation, value});
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
