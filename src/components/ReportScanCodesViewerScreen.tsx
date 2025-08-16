import { openShareSheet, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { Share } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { BSON } from 'realm';
import { ScanCodesReport } from 'realmdb/ScanCodesReport';
import { ReportViewerNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ReportViewerNavigatorParamList,
  'ReportScanCodesViewer'
>;

const ReportScanCodesViewerScreen = ({ route, navigation }: Props) => {
  const { reportId } = route.params;

  const theme = useTheme();

  const report = useObject(ScanCodesReport, new BSON.ObjectId(reportId));

  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Close'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={navigation.goBack}
          />
        );
      },
      headerRight: () => {
        return (
          <Button
            icon={<Share color={theme.colors.screenHeaderButtonText} />}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={() =>
              viewShotRef.current?.capture
                ? viewShotRef.current.capture()
                : null
            }
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    theme.colors.screenHeaderButtonText,
    theme.styles.buttonScreenHeader,
    theme.styles.buttonScreenHeaderTitle,
  ]);

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
