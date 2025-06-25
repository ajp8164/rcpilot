import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {
  ReportViewerNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';

import { CompositeScreenProps } from '@react-navigation/core';
import React from 'react';
import ReportEventsMaintenanceViewerScreen from 'components/ReportEventsMaintenanceViewerScreen';
import ReportScanCodesViewerScreen from 'components/ReportScanCodesViewerScreen';
import { useTheme } from 'theme';

const ReportViewerStack =
  createNativeStackNavigator<ReportViewerNavigatorParamList>();

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ReportViewerNavigator'>,
  NativeStackScreenProps<ReportViewerNavigatorParamList>
>;

const ReportViewerNavigator = () => {
  const theme = useTheme();

  return (
    <ReportViewerStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <ReportViewerStack.Screen
        name="ReportEventsMaintenanceViewer"
        component={ReportEventsMaintenanceViewerScreen}
        options={{
          title: 'Event Report',
        }}
      />
      <ReportViewerStack.Screen
        name="ReportScanCodesViewer"
        component={ReportScanCodesViewerScreen}
        options={{
          title: 'QR Code Report',
        }}
      />
    </ReportViewerStack.Navigator>
  );
};

export default ReportViewerNavigator;
