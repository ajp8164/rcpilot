import { AppTheme, useTheme } from 'theme';
import { BatteryScanCodeReportFilterValue, FilterType } from 'types/filter';
import { EnumRelation, FilterState, ListItemFilterEnum, ListItemFilterNumber, NumberRelation } from 'components/molecules/filters';
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

export type Props = NativeStackScreenProps<ReportFiltersNavigatorParamList, 'ReportBatteryScanCodesFilterEditor'>;

const ReportBatteryScanCodesFilterEditorScreen = ({ navigation, route }: Props) => {
  const { filterId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();
  const reportFilter = useObject(Filter, new BSON.ObjectId(filterId));

  const [name, setName] = useState(reportFilter?.name || undefined);
  const [values, setValues] = useSetState(reportFilter?.values || {});

  // const [values, setValues] = useSetState<BatteryScanCodeReportFilterValues>({
  //   [BatteryScanCodeReportFilterValue.Capacity]: {relation: NumberRelation.Any, value: ''},
  //   [BatteryScanCodeReportFilterValue.Chemistry]: {relation: EnumRelation.Any, value: ''},
  // });

  const onFilterValueChange = (
    property: BatteryScanCodeReportFilterValue,
    value: FilterState) => {
    setValues({[property]: value});
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
          reportFilter.type = FilterType.ReportBatteryScanCodesFilter;
          reportFilter.values = values;
        });
      } else {
        realm.write(() => {
          realm.create('Filter', {
            name,
            type: FilterType.ReportBatteryScanCodesFilter,
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
      <Divider text={'This filter shows all the maintenance items that match all of these criteria.'}/>
      <ListItemFilterEnum
        title={'Chemistry'}
        value={values[BatteryScanCodeReportFilterValue.Chemistry]?.value}
        relation={EnumRelation.Any}
        enumName={'Chemistries'}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryScanCodeReportFilterValue.Chemistry, {relation, value});
        }}
      />
      <Divider />
      <ListItemFilterNumber
        title={'Capacity'}
        label={'mAh'}
        value={values[BatteryScanCodeReportFilterValue.Capacity]?.value}
        relation={NumberRelation.Any}
        position={['first', 'last']}
        onValueChange={(relation, value) => {
          onFilterValueChange(BatteryScanCodeReportFilterValue.Capacity, {relation, value});
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

export default ReportBatteryScanCodesFilterEditorScreen;
