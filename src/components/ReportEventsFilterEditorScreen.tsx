import { AppTheme, useTheme } from 'theme';
import { DateRelation, EnumRelation, FilterState, ListItemFilterDate, ListItemFilterEnum, ListItemFilterNumber, NumberRelation } from 'components/molecules/filters';
import { EventReportFilterValue, FilterType } from 'types/filter';
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
import { useSetState } from '@react-native-ajp-elements/core';

export type Props = NativeStackScreenProps<ReportFiltersNavigatorParamList, 'ReportEventsFilterEditor'>;

const ReportEventsFilterEditorScreen = ({ navigation, route }: Props) => {
  const { filterId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();
  const reportFilter = useObject(Filter, new BSON.ObjectId(filterId));

  const [name, setName] = useState(reportFilter?.name || undefined);
  const [values, setValues] = useSetState(reportFilter?.values || {});

  // const [values, setValues] = useSetState<EventReportFilterValues>({
  //   [EventReportFilterValue.Model]: {relation: EnumRelation.Any, value: ''},
  //   [EventReportFilterValue.ModelType]: {relation: EnumRelation.Any, value: ''},
  //   [EventReportFilterValue.Category]: {relation: EnumRelation.Any, value: ''},
  //   [EventReportFilterValue.Date]: {relation: DateRelation.Any, value: ''},
  //   [EventReportFilterValue.Duration]: {relation: NumberRelation.Any, value: ''},
  //   [EventReportFilterValue.Pilot]: {relation: EnumRelation.Any, value: ''},
  //   [EventReportFilterValue.Location]: {relation: EnumRelation.Any, value: ''},
  //   [EventReportFilterValue.ModelStyle]: {relation: EnumRelation.Any, value: ''},
  //   [EventReportFilterValue.Outcome]: {relation: EnumRelation.Any, value: ''},
  // });

  const onFilterValueChange = (property: EventReportFilterValue, value: FilterState) => {
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
          reportFilter.type = FilterType.ReportEventsFilter
          reportFilter.values = values;
        });
      } else {
        realm.write(() => {
          realm.create('Filter', {
            name,
            type: FilterType.ReportEventsFilter,
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
        value={values[EventReportFilterValue.Model]?.value}
        relation={EnumRelation.Any}
        enumName={'Models'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(EventReportFilterValue.Model, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Model Type'}
        value={values[EventReportFilterValue.ModelType]?.value}
        relation={EnumRelation.Any}
        enumName={'ModelTypes'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(EventReportFilterValue.ModelType, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Category'}
        value={values[EventReportFilterValue.Category]?.value}
        relation={EnumRelation.Any}
        enumName={'Categories'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(EventReportFilterValue.Category, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterDate
        title={'Date'}
        value={values[EventReportFilterValue.Date]?.value}
        relation={DateRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(EventReportFilterValue.Date, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Duration'}
        label={'m:ss'}
        value={values[EventReportFilterValue.Duration]?.value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(EventReportFilterValue.Duration, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Pilot'}
        value={values[EventReportFilterValue.Pilot]?.value}
        relation={EnumRelation.Any}
        enumName={'Pilots'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(EventReportFilterValue.Pilot, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Location'}
        value={values[EventReportFilterValue.Location]?.value}
        relation={EnumRelation.Any}
        enumName={'Locations'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(EventReportFilterValue.Location, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Style'}
        value={values[EventReportFilterValue.ModelStyle]?.value}
        relation={EnumRelation.Any}
        enumName={'ModelStyles'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(EventReportFilterValue.ModelStyle, {relation, value});
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

export default ReportEventsFilterEditorScreen;
