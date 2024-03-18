import { BSON } from 'realm';
import { EmptyView } from 'components/molecules/EmptyView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ReportViewerNavigatorParamList } from 'types/navigation';
import { ScanCodesReport } from 'realmdb/ScanCodesReport';
import ViewShot from 'react-native-view-shot';
import { useObject } from '@realm/react';

export type Props = NativeStackScreenProps<ReportViewerNavigatorParamList, 'ReportScanCodesViewer'>;

const ReportScanCodesViewerScreen = ({ route }: Props) => {
  const { reportId } = route.params;

  const report = useObject(ScanCodesReport, new BSON.ObjectId(reportId));

  if (!report) {
    return <EmptyView error message={'Report Not Found!'} />;
  }

  return <ViewShot style={{}} />;
};

export default ReportScanCodesViewerScreen;
