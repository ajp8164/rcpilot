import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { eqBoolean, eqObject, eqString } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Divider } from '@react-native-ajp-elements/ui';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScanCodesReport } from 'realmdb/ScanCodesReport';
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { filterSummary } from 'lib/filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useSelector } from 'react-redux';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ReportScanCodesEditor'>;

const ReportScanCodesEditorScreen = ({ navigation, route }: Props) => {
  const { reportId } = route.params;
  
  const theme = useTheme();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();

  const report = useObject(ScanCodesReport, new BSON.ObjectId(reportId));
  const reportModeslFilterId = useSelector(selectFilters(FilterType.ReportModelScanCodesFilter));
  const reportBatteriesFilterId = useSelector(selectFilters(FilterType.ReportBatteryScanCodesFilter));

  const [name, setName] = useState<string | undefined>(report?.name);
  const [ordinal, _setOrdinal] = useState<number>(report?.ordinal || 999);
  const [includesModels, setIncludesModels] = useState(report ? report.includesModels : true);
  const [includesBatteries, setIncludesBatteries] = useState(report ? report.includesBatteries : true);
  const [modelScanCodesFilter, setModelScanCodesFilter] = useState(report?.modelScanCodesFilter);
  const [batteryScanCodesFilter, setBatteryScanCodesFilter] = useState(report?.batteryScanCodesFilter);

  useEffect(() => {
    const filter = 
      realm.objectForPrimaryKey('Filter', new BSON.ObjectId(reportModeslFilterId)) as Filter;
    setModelScanCodesFilter(filter);

    // Update the exiting report immediately.
    if (report)  {
      realm.write(() => {
        report.modelScanCodesFilter = filter;
      });
    }
  }, [ reportModeslFilterId ]);

  useEffect(() => {
    const filter = 
      realm.objectForPrimaryKey('Filter', new BSON.ObjectId(reportBatteriesFilterId)) as Filter;
    setBatteryScanCodesFilter(filter);

    // Update the exiting report immediately.
    if (report)  {
      realm.write(() => {
        report.batteryScanCodesFilter = filter;
      });
    }
  }, [ reportBatteriesFilterId ]);

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

    setScreenEditHeader(
      {enabled: canSave, action: onDone},
      {visible: !reportId},
    );
  }, [
    name,
    includesModels,
    includesBatteries,
    modelScanCodesFilter,
    batteryScanCodesFilter,
  ]);

  return (
    <ScrollView style={theme.styles.view}>
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
            subtitle={modelScanCodesFilter ? filterSummary(modelScanCodesFilter) : 'Report will include all models'}
            position={['last']}
            onPress={() => navigation.navigate('ReportModelScanCodeFiltersNavigator', {
              screen: 'ReportModelScanCodeFilters',
              params: {
                filterType: FilterType.ReportModelScanCodesFilter,
              }
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
            subtitle={batteryScanCodesFilter ? filterSummary(batteryScanCodesFilter) : 'Report will include all batteries'}
            position={['last']}
            onPress={() => navigation.navigate('ReportBatteryScanCodeFiltersNavigator', {
              screen: 'ReportBatteryScanCodeFilters',
              params: {
                filterType: FilterType.ReportBatteryScanCodesFilter,
              }
            })}
          />
        }
      />
    </ScrollView>
  );
};

export default ReportScanCodesEditorScreen;
