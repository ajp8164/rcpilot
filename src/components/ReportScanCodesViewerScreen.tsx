import React, { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import ViewShot from 'react-native-view-shot';

import { openShareSheet } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject } from '@realm/react';
import { HeaderButton, HeaderIconButton, headerOptions } from 'components/atoms/navigation';
import { EmptyView } from 'components/molecules/EmptyView';
import { Share } from 'lucide-react-native';
import { BSON } from 'realm';
import { ScanCodesReport } from 'realmdb/ScanCodesReport';
import { ReportViewerNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ReportViewerNavigatorParamList,
  'ReportScanCodesViewer'
>;

const ReportScanCodesViewerScreen = ({ route, navigation }: Props) => {
  const { reportId } = route.params;

  const report = useObject(ScanCodesReport, new BSON.ObjectId(reportId));

  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    navigation.setOptions(
      headerOptions({
        left: [<HeaderButton label={'Close'} onPress={navigation.goBack} />],
        right: [
          <HeaderIconButton
            Icon={Share}
            onPress={() =>
              viewShotRef.current?.capture
                ? viewShotRef.current.capture()
                : null
            }
          />,
        ],
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCapture = (url: string) => {
    openShareSheet({
      title: 'Event/Maintenance Report',
      message: '',
      subject: 'Event/Maintenance Report',
      email: '',
      url,
    });
  };

  if (!report) {
    return <EmptyView error message={'Report Not Found!'} />;
  }

  return (
    <ViewShot ref={viewShotRef} onCapture={onCapture} style={{}}>
      <Text>{'hello'}</Text>
    </ViewShot>
  );
};

export default ReportScanCodesViewerScreen;
