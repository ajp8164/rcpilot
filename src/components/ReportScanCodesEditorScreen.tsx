import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ReportFiltersNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { FilterType } from 'types/filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  // const report = useObject(ScanCodesReport, new BSON.ObjectId(reportId));

  const [name, setName] = useState<string | undefined>(undefined);
  // const batteryScanCodesFilter = report.batteryScanCodesFilter;
  // const modelScanCodesFilter = report.modelScanCodesFilter;

  const [includesBatteries, setIncludesBatteries] = useState(true);
  const [includesModels, setIncludesModels] = useState(true);
  const [batteryScanCodesFilterId, setBatteryScanCodesFilterId] = useState();
  const [modelScanCodesFilterId, setModelScanCodesFilterId] = useState();

  useEffect(() => {
    event.on('battery-scan-codes-report-filter', setBatteryScanCodesFilterId);
    event.on('model-scan-codes-report-filter', setModelScanCodesFilterId);
    return () => {
      event.removeListener('battery-scan-codes-report-filter', setBatteryScanCodesFilterId);
      event.removeListener('model-scan-codes-report-filter', setModelScanCodesFilterId);
    };
  }, []);

  useState(() => {
    // Fetch filter from realm to update view
  }), [ batteryScanCodesFilterId ];

  useState(() => {
    // Fetch filter from realm to update view
  }), [ modelScanCodesFilterId ];

  useEffect(() => {
    const canSave = name !== undefined;

    const save = () => {
      realm.write(() => {
        realm.create('Report', {
          name
        });
      });
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
            onPress={navigation.goBack}
          />
        )
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
  }, [name]);

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
        position={['first']}
        onValueChange={setIncludesModels}
      />
      <ListItem
        title={'modelScanCodesFilter.name' || 'No Filter Selected'}
        subtitle={'Report will include all models'}
        position={['last']}
        onPress={() => navigation.navigate('ReportFiltersNavigator', {
          screen: 'ReportFilters',
          params: { 
            filterType: FilterType.ReportModelScanCodesFilter,
            eventName: 'model-scan-codes-report-filter',
          },
        })}
      />
      <Divider />
      <ListItemSwitch
        title={'Includes Batteries'}
        value={includesBatteries}
        position={['first']}
        onValueChange={setIncludesBatteries}
      />
      <ListItem
        title={'batteryScanCodesFilter.name' || 'No Filter Selected'}
        subtitle={'Report will include all batteries'}
        position={['last']}
        onPress={() => navigation.navigate('ReportFiltersNavigator', {
          screen: 'ReportFilters',
          params: { 
            filterType: FilterType.ReportBatteryScanCodesFilter,
            eventName: 'battery-scan-codes-report-filter',
          },
        })}
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
