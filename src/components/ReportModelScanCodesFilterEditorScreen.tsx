import { AppTheme, useTheme } from 'theme';
import { DateRelation, EnumRelation, FilterState, ListItemFilterDate, ListItemFilterEnum } from 'components/molecules/filters';
import { FilterType, ModelScanCodesReportFilterValues } from 'types/filter';
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

const defaultFilter: ModelScanCodesReportFilterValues = {
  modelType: {relation: EnumRelation.Any, value: []},
  category: {relation: EnumRelation.Any, value: []},
  lastEvent: {relation: DateRelation.Any, value: []},
};

export type Props = NativeStackScreenProps<ReportFiltersNavigatorParamList, 'ReportModelScanCodesFilterEditor'>;

const ReportModelScanCodesFilterEditorScreen = ({ navigation, route }: Props) => {
  const { filterId, eventName } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const realm = useRealm();
  const reportFilter = useObject(Filter, new BSON.ObjectId(filterId));

  const [name, setName] = useState(reportFilter?.name || undefined);
  const [values, setValues] = useSetState(reportFilter?.toJSON().values as ModelScanCodesReportFilterValues || defaultFilter);

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
          reportFilter.type = FilterType.ReportModelScanCodesFilter;
          reportFilter.values = values;
        });
      } else {
        realm.write(() => {
          realm.create('Filter', {
            name,
            type: FilterType.ReportModelScanCodesFilter,
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

  const onFilterValueChange = (property: keyof ModelScanCodesReportFilterValues, value: FilterState) => {
    setValues({ [property]: value }, {assign: true});
  };

  const resetFilter = () => {
    setValues(defaultFilter, {assign: true});
  };

  const relationsAreDefault = () => {
    // Whether or not the set value relations are all set to the default value relations.
    let result = false;
    Object.keys(values).forEach(k => {
      result = result || 
        (values[k as keyof ModelScanCodesReportFilterValues].relation !==
          defaultFilter[k as keyof ModelScanCodesReportFilterValues].relation);
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
      <Divider text={'This filter shows all the maintenance items that match all of these criteria.'}/>
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
        title={'Last Event'}
        value={values.lastEvent.value}
        relation={values.lastEvent.relation}
        position={['first', 'last']}
        onValueChange={filterState => {
          onFilterValueChange('lastEvent', filterState);
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

export default ReportModelScanCodesFilterEditorScreen;
