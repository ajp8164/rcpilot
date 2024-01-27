import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ReportFiltersNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import { eqBoolean, eqObject, eqString } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScanCodesReport } from 'realmdb/ScanCodesReport';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ReportScanCodesEditor'>,
  NativeStackScreenProps<ReportFiltersNavigatorParamList>
>;

const ReportScanCodesEditorScreen = ({ navigation, route }: Props) => {
  const { reportId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const realm = useRealm();

  const report = useObject(ScanCodesReport, new BSON.ObjectId(reportId));

  const [name, setName] = useState<string | undefined>(report?.name);
  const [ordinal, _setOrdinal] = useState<number>(report?.ordinal || 999);
  const [includesModels, setIncludesModels] = useState(report ? report.includesModels : true);
  const [includesBatteries, setIncludesBatteries] = useState(report ? report.includesBatteries : true);
  const [modelScanCodesFilter, setModelScanCodesFilter] = useState(report?.modelScanCodesFilter);
  const [batteryScanCodesFilter, setBatteryScanCodesFilter] = useState(report?.batteryScanCodesFilter);

  useEffect(() => {
    event.on('battery-scan-codes-report-filter-selection', onChangeBatteryScanCodesFilterSelection);
    event.on('model-scan-codes-report-filter-selection', onChangeModelScanCodesFilterSelection);
    event.on('report-filter', onChangeFilter);
    return () => {
      event.removeListener('battery-scan-codes-report-filter-selection', onChangeBatteryScanCodesFilterSelection);
      event.removeListener('model-scan-codes-report-filter-selection', onChangeModelScanCodesFilterSelection);
      event.removeListener('report-filter', onChangeFilter);
    };
  }, []);

  const onChangeBatteryScanCodesFilterSelection = (filterId?: string) => {
    const filter = 
      (filterId && realm.objectForPrimaryKey('Filter', new BSON.ObjectId(filterId)) as Filter) || undefined;
    setBatteryScanCodesFilter(filter);

    // Update the exiting report immediately.
    if (report)  {
      realm.write(() => {
        report.batteryScanCodesFilter = filter;
      });
    }
  };

  const onChangeModelScanCodesFilterSelection = (filterId?: string) => {
    const filter = 
      (filterId && realm.objectForPrimaryKey('Filter', new BSON.ObjectId(filterId)) as Filter) || undefined;
    setModelScanCodesFilter(filter);

    // Update the exiting report immediately.
    if (report)  {
      realm.write(() => {
        report.modelScanCodesFilter = filter;
      });
    }
  };

  const onChangeFilter = (filterId: string) => {
    // A filter change was made. Retrive the filter and if it's the selected
    // filter for this report then update our local state to force a render of
    // the filter summary.
    const changedFilter = realm.objectForPrimaryKey('Filter', new BSON.ObjectId(filterId)) as Filter;
    if (changedFilter.type === FilterType.ReportBatteryScanCodesFilter) {
      if (filterId === report?.batteryScanCodesFilter?._id.toString()) {
        setBatteryScanCodesFilter(changedFilter);
      }
    } else if (changedFilter.type === FilterType.ReportModelScanCodesFilter)  {
      if (filterId === report?.modelScanCodesFilter?._id.toString()) {
        setModelScanCodesFilter(changedFilter);
      }
    }
  };

  useEffect(() => {
    const canSave = !!name && (
      !eqString(report?.name, name) ||
      !eqBoolean(report?.includesModels, includesModels) ||
      !eqBoolean(report?.includesBatteries, includesBatteries) ||
      !eqObject(report?.modelScanCodesFilter, modelScanCodesFilter) ||
      !eqObject(report?.batteryScanCodesFilter, batteryScanCodesFilter)
    );

    const save = () => {
      if (reportId) {
        // Update existing report.
        realm.write(() => {
          report!.name = name!;
          report!.includesModels = includesModels;
          report!.includesBatteries = includesBatteries;
          report!.modelScanCodesFilter = modelScanCodesFilter;
          report!.batteryScanCodesFilter = batteryScanCodesFilter;
        });
      } else {
        // Insert new report.
        realm.write(() => {
          realm.create('ScanCodesReport', {
            name,
            ordinal,
            includesModels,
            includesBatteries,
            modelScanCodesFilter,
            batteryScanCodesFilter,
          });
        });
      }
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    navigation.setOptions({
      headerLeft: () => {
        if (!reportId) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
              onPress={navigation.goBack}
            />
          )
        }
      },
      headerRight: () => {
        if (canSave) {
          return (
            <Button
              title={'Done'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.doneButton]}
              onPress={onDone}
            />
          )
        }
      },
    });
  }, [
    name,
    includesModels,
    includesBatteries,
    modelScanCodesFilter,
    batteryScanCodesFilter,
  ]);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider text={'REPORT NAME'}/>
      <ListItemInput
        value={name}
        placeholder={'Report Name'}
        position={['first', 'last']}
        onChangeText={setName}
      /> 
      <Divider text={'CONTENTS'}/>
      <ListItemSwitch
        title={'Includes Models'}
        value={includesModels}
        position={includesModels ? ['first'] : ['first', 'last']}
        onValueChange={setIncludesModels}
        expanded={includesModels}
        ExpandableComponent={
          <ListItem
            title={modelScanCodesFilter?.name || 'No Filter Selected'}
            subtitle={'Report will include all models'}
            position={['last']}
            onPress={() => navigation.navigate('ReportFiltersNavigator', {
              screen: 'ReportFilters',
              params: { 
                filterType: FilterType.ReportModelScanCodesFilter,
                filterId: modelScanCodesFilter?._id.toString(),
                eventName: 'model-scan-codes-report-filter-selection',
              },
            })}
          />
        }
      />
      <Divider />
      <ListItemSwitch
        title={'Includes Batteries'}
        value={includesBatteries}
        position={includesBatteries ? ['first'] : ['first', 'last']}
        onValueChange={setIncludesBatteries}
        expanded={includesBatteries}
        ExpandableComponent={
          <ListItem
            title={batteryScanCodesFilter?.name || 'No Filter Selected'}
            subtitle={'Report will include all batteries'}
            position={['last']}
            onPress={() => navigation.navigate('ReportFiltersNavigator', {
              screen: 'ReportFilters',
              params: { 
                filterType: FilterType.ReportBatteryScanCodesFilter,
                filterId: batteryScanCodesFilter?._id.toString(),
                eventName: 'battery-scan-codes-report-filter-selection',
              },
            })}
          />
        }
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default ReportScanCodesEditorScreen;
