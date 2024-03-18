import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { NewReportNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';

import { CompositeScreenProps } from '@react-navigation/core';
import React from 'react';
import ReportBatteryScanCodeFiltersNavigator from 'components/navigation/ReportBatteryScanCodeFiltersNavigator';
import ReportEventFiltersNavigator from 'components/navigation/ReportEventFiltersNavigator';
import ReportEventsMaintenaceEditorScreen from 'components/ReportEventsMaintenaceEditorScreen';
import ReportMaintenanceFiltersNavigator from 'components/navigation/ReportMaintenanceFiltersNavigator';
import ReportModelScanCodeFiltersNavigator from 'components/navigation/ReportModelScanCodeFiltersNavigator';
import ReportScanCodesEditorScreen from 'components/ReportScanCodesEditorScreen';
import { useTheme } from 'theme';

const NewReportStack = createNativeStackNavigator<NewReportNavigatorParamList>();

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'NewReportNavigator'>,
  NativeStackScreenProps<NewReportNavigatorParamList>
>;

const NewReportNavigator = () => {
  const theme = useTheme();

  return (
    <NewReportStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <NewReportStack.Screen
        name="ReportEventsMaintenanceEditor"
        component={ReportEventsMaintenaceEditorScreen}
        options={{
          title: 'Log Report',
          presentation: 'fullScreenModal',
        }}
      />
      <NewReportStack.Screen
        name="ReportScanCodesEditor"
        component={ReportScanCodesEditorScreen}
        options={{
          title: 'QR Code Report',
          presentation: 'fullScreenModal',
        }}
      />
      <NewReportStack.Screen
        name="ReportEventFiltersNavigator"
        component={ReportEventFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <NewReportStack.Screen
        name="ReportBatteryScanCodeFiltersNavigator"
        component={ReportBatteryScanCodeFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <NewReportStack.Screen
        name="ReportModelScanCodeFiltersNavigator"
        component={ReportModelScanCodeFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <NewReportStack.Screen
        name="ReportMaintenanceFiltersNavigator"
        component={ReportMaintenanceFiltersNavigator}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </NewReportStack.Navigator>
  );
};

export default NewReportNavigator;
