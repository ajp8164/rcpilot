import { AppTheme, useTheme } from 'theme';
import { DateRelation, EnumRelation, FilterState, ListItemFilterDate, ListItemFilterEnum, ListItemFilterNumber, NumberRelation } from 'components/molecules/filters';
import { EventReportFilterValues, FilterType } from 'types/filter';
import { ListItem, ListItemInput } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { eqObject, eqString } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { Filter } from 'realmdb/Filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReportFiltersNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useSetState } from '@react-native-ajp-elements/core';

const defaultFilter: EventReportFilterValues = {
  model: {relation: EnumRelation.Any, value: []},
  modelType: {relation: EnumRelation.Any, value: []},
  category: {relation: EnumRelation.Any, value: []},
  date: {relation: DateRelation.Any, value: []},
  duration: {relation: NumberRelation.Any, value: []},
  pilot: {relation: EnumRelation.Any, value: []},
  location: {relation: EnumRelation.Any, value: []},
  modelStyle: {relation: EnumRelation.Any, value: []},
  outcome: {relation: EnumRelation.Any, value: []},
};

const filterValueLabels: Record<string, string> = {
  duration: 'm:ss',
};

export type Props = NativeStackScreenProps<ReportFiltersNavigatorParamList, 'ReportEventsFilterEditor'>;

const ReportEventsFilterEditorScreen = ({ navigation, route }: Props) => {
  const { filterId, eventName } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const reportFilter = useObject(Filter, new BSON.ObjectId(filterId));

  const [name, setName] = useState(reportFilter?.name || undefined);
  const [values, setValues] = useSetState(reportFilter?.toJSON().values as EventReportFilterValues || defaultFilter);

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
          reportFilter.type = FilterType.ReportEventsFilter;
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

    setScreenEditHeader({enabled: canSave, action: onDone});
  }, [ name, values ]);

  const onFilterValueChange = (property: keyof EventReportFilterValues, filterState: FilterState) => {
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
        (values[k as keyof EventReportFilterValues].relation !==
          defaultFilter[k as keyof EventReportFilterValues].relation);
    });
    return !result;
  };

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
        title={'Duration'}
        label={filterValueLabels['duration']}
        numericProps={{separator: ':', prefix: '', maxValue: 999}}
        value={values.duration.value}
        relation={values.duration?.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('duration', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Pilot'}
        value={values.pilot.value}
        relation={values.pilot.relation}
        enumName={'Pilots'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('pilot', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Location'}
        value={values.location.value}
        relation={values.location.relation}
        enumName={'Locations'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('location', filterState);
        }}
      />
      <Divider />
      <ListItemFilterEnum
        title={'Style'}
        value={values.modelStyle.value}
        relation={values.modelStyle.relation}
        enumName={'ModelStyles'}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('modelStyle', filterState);
        }}
      />
      <Divider />
      <View style={{height: theme.insets.bottom}}/>
    </ScrollView>  );
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

export default ReportEventsFilterEditorScreen;
