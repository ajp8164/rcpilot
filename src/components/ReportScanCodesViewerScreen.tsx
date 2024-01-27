import { AppTheme, useTheme } from 'theme';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ReportViewerNavigatorParamList } from 'types/navigation';
import { ScanCodesReport } from 'realmdb/ScanCodesReport';
import ViewShot from "react-native-view-shot";
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<ReportViewerNavigatorParamList, 'ReportScanCodesViewer'>;

const ReportScanCodesViewerScreen = ({ route, navigation }: Props) => {
  const { reportId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();
  const report = useObject(ScanCodesReport, new BSON.ObjectId(reportId));

  return (
    <ViewShot style={{}}>
    </ViewShot>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
}));

export default ReportScanCodesViewerScreen;
