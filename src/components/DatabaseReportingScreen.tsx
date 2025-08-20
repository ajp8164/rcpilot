import React, { useEffect, useRef, useState } from 'react';
import { LayoutRectangle, Platform, View } from 'react-native';
import {
  DragEndParams,
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useDispatch, useSelector } from 'react-redux';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItem,
  ListItemSwipeable,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { Button } from 'components/atoms/Button';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Plus, Trash2 } from 'lucide-react-native';
import { BSON } from 'realm';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { ScanCodesReport } from 'realmdb/ScanCodesReport';
import { selectOutputReportTo } from 'store/selectors/appSettingsSelectors';
import { saveOutputReportTo } from 'store/slices/appSettings';
import {
  OutputReportTo,
  OutputReportToDescription,
  ReportType,
} from 'types/database';
import {
  NewReportNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'DatabaseReporting'>,
  NativeStackScreenProps<
    NewReportNavigatorParamList,
    'ReportEventsMaintenanceEditor'
  >
>;

type Report = EventsMaintenanceReport | ScanCodesReport;

// Destination report editor based on report type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reportEditor: { [key in ReportType]: any } = {
  [ReportType.EventsMaintenance]: 'ReportEventsMaintenanceEditor',
  [ReportType.ScanCodes]: 'ReportScanCodesEditor',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reportViewer: { [key in ReportType]: any } = {
  [ReportType.EventsMaintenance]: 'ReportEventsMaintenanceViewer',
  [ReportType.ScanCodes]: 'ReportScanCodesViewer',
};

const DatabaseReportingScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const event = useEvent();

  const outputReportTo = useSelector(selectOutputReportTo);

  const realm = useRealm();
  const emReports = useQuery<EventsMaintenanceReport>(
    'EventsMaintenanceReport',
  );
  const scReports = useQuery<ScanCodesReport>('ScanCodesReport');

  // Decoupled from realm for use in list safe delete/reorder.
  const [safeEmReports, setSafeEMReports] = useState<EventsMaintenanceReport[]>(
    [],
  );
  const [safeScReports, setSafeSCReports] = useState<ScanCodesReport[]>([]);

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();
  const [listLayout, setListLayout] = useState<LayoutRectangle>();

  useEffect(() => {
    const reports: EventsMaintenanceReport[] = emReports
      .sorted('ordinal')
      .filter(r => r.isValid())
      .map(r => JSON.parse(JSON.stringify(r)));
    setSafeEMReports(reports);
  }, [emReports]);

  useEffect(() => {
    const reports: ScanCodesReport[] = scReports
      .sorted('ordinal')
      .filter(r => r.isValid())
      .map(r => JSON.parse(JSON.stringify(r)));
    setSafeSCReports(reports);
  }, [scReports]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (!emReports.length && !scReports.length) {
          return null;
        }
        return (
          <Button
            title={listEditorState?.enabled ? 'Done' : 'Edit'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={() => listEditorRef.current?.onToggleEditMode()}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listEditorState?.enabled, emReports, scReports]);

  useEffect(() => {
    event.on('output-report-to', setOutputReportTo);
    // event.on('events-maintenace-report', );
    // event.on('scan-codes-report', );
    return () => {
      event.removeListener('ouput-report-to', setOutputReportTo);
      // event.removeListener('events-maintenace-report', );
      // event.removeListener('scan-codes-report', );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setOutputReportTo = (result: EnumPickerResult) => {
    dispatch(saveOutputReportTo({ value: result.value[0] as OutputReportTo }));
  };

  const emReportSummary = (report: EventsMaintenanceReport) => {
    const whichEvents = report.eventsFilter
      ? `"${report.eventsFilter.name}" filter`
      : 'All';
    const whichMaintenance = report.maintenanceFilter
      ? `"${report.maintenanceFilter.name}" filter`
      : 'All';
    const summary = report.includesSummary ? 'Summary, ' : '';
    const events = report.includesEvents ? `Events: ${whichEvents}, ` : '';
    const maintenance = report.includesMaintenance
      ? `Maintenance: ${whichMaintenance}`
      : '';
    return (
      `${summary}${events}${maintenance}`.replace(/,\s*$/, '') ||
      'Report is empty'
    );
  };

  const scReportSummary = (report: ScanCodesReport) => {
    const whichEvents = report.batteryScanCodesFilter
      ? `"${report.batteryScanCodesFilter.name}" filter`
      : 'All';
    const whichMaintenance = report.modelScanCodesFilter
      ? `"${report.modelScanCodesFilter.name}" filter`
      : 'All';
    const events = report.includesBatteries
      ? `Batteries: ${whichEvents}, `
      : '';
    const maintenance = report.includesModels
      ? `Models: ${whichMaintenance}`
      : '';
    return `${events}${maintenance}`.replace(/,\s*$/, '') || 'Report is empty';
  };

  const deleteReport = (reportId: string, reportType: ReportType) => {
    switch (reportType) {
      case ReportType.EventsMaintenance:
        deleteEMReport(reportId);
        break;
      case ReportType.ScanCodes:
        deleteSCReport(reportId);
        break;
    }
  };

  const deleteEMReport = (reportId: string) => {
    realm.write(() => {
      const report = realm.objectForPrimaryKey(
        'EventsMaintenanceReport',
        new BSON.ObjectId(reportId),
      );
      if (report?.isValid()) {
        realm.delete(report);
      }
    });
  };

  const deleteSCReport = (reportId: string) => {
    realm.write(() => {
      const report = realm.objectForPrimaryKey(
        'ScanCodesReport',
        new BSON.ObjectId(reportId),
      );
      if (report?.isValid()) {
        realm.delete(report);
      }
    });
  };

  const reorderEMReports = (params: DragEndParams<Report>) => {
    const { data } = params;
    realm.write(() => {
      data.forEach((report, index) => {
        const obj = realm.objectForPrimaryKey<EventsMaintenanceReport>(
          'EventsMaintenanceReport',
          new BSON.ObjectId(report._id), // Clone has string id
        );
        if (obj?.isValid()) {
          obj.ordinal = index;
        }
      });
    });
  };

  const reorderSCReports = (params: DragEndParams<Report>) => {
    const { data } = params;
    realm.write(() => {
      data.forEach((report, index) => {
        const obj = realm.objectForPrimaryKey<ScanCodesReport>(
          'ScanCodeReport',
          new BSON.ObjectId(report._id), // Clone has string id
        );
        if (obj?.isValid()) {
          obj.ordinal = index;
        }
      });
    });
  };

  const renderReport = (props: {
    report: Report;
    reportType: ReportType;
    reportCount: number;
    reportSummary: string;
    index: number;
    drag: () => void;
    isActive: boolean;
  }) => {
    const {
      report,
      reportType,
      reportCount,
      reportSummary,
      index,
      drag,
      isActive,
    } = props;
    // `report` is a cloned plain object but still typed as a realm object.
    // Use _id.toString() to satisfy types.
    return (
      <ListItemSwipeable
        title={report.name}
        subtitle={reportSummary}
        position={listItemPosition(index, reportCount)}
        rightContent={'info'}
        listEditor={listEditorRef.current}
        onPressRight={() =>
          navigation.navigate(reportEditor[reportType], {
            reportId: report._id.toString(),
          })
        }
        onPress={() =>
          navigation.navigate('ReportViewerNavigator', {
            screen: reportViewer[reportType],
            params: {
              reportId: report._id.toString(),
            },
          })
        }
        drag={drag}
        dragIsActive={isActive}
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
          draggable: true,
        }}
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: 'Delete Report',
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this report?',
              });
            },
            onPress: () => deleteReport(report._id.toString(), reportType),
          },
        ]}
      />
    );
  };

  const renderEMReport = ({
    item: report,
    getIndex,
    drag,
    isActive,
  }: RenderItemParams<EventsMaintenanceReport>) => {
    const index = getIndex();
    if (index === undefined) return null;
    return renderReport({
      report,
      reportType: ReportType.EventsMaintenance,
      reportCount: emReports.length,
      reportSummary: emReportSummary(report),
      index,
      drag,
      isActive,
    });
  };

  const renderSCReport = ({
    item: report,
    getIndex,
    drag,
    isActive,
  }: RenderItemParams<ScanCodesReport>) => {
    const index = getIndex();
    if (index === undefined) return null;
    return renderReport({
      report,
      reportType: ReportType.ScanCodes,
      reportCount: scReports.length,
      reportSummary: scReportSummary(report),
      index,
      drag,
      isActive,
    });
  };

  return (
    <ListEditor
      ref={listEditorRef}
      onChangeState={setListEditorState}
      listLayout={listLayout}>
      <NestableScrollContainer
        style={theme.styles.view}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'DESTINATION'} />
        <ListItem
          title={'Output Report To'}
          value={outputReportTo}
          position={['first', 'last']}
          rightContent={'chevron-right'}
          onPress={() =>
            navigation.navigate('EnumPicker', {
              title: 'Output To',
              footer: 'Specifies the destination for database report output.',
              values: Object.values(OutputReportTo),
              selected: outputReportTo,
              eventName: 'output-report-to',
            })
          }
        />
        <Divider
          note
          light
          subHeaderStyle={theme.text.small}
          text={
            OutputReportToDescription[
              Object.keys(OutputReportTo)[
                Object.values(OutputReportTo).indexOf(outputReportTo)
              ] as keyof typeof OutputReportToDescription
            ]
          }
        />
        <View
          style={[{ flex: 1 }]}
          onLayout={e => setListLayout(e.nativeEvent.layout)}>
          <Divider
            text={'EVENT/MAINTENANCE LOG REPORTS'}
            rightComponent={
              <Button
                buttonStyle={theme.styles.dividerIconButton}
                icon={<Plus color={theme.colors.screenHeaderButtonText} />}
                onPress={() =>
                  navigation.navigate('NewReportNavigator', {
                    screen: 'ReportEventsMaintenanceEditor',
                    params: {},
                  })
                }
              />
            }
          />
          {emReports.length ? (
            <>
              <View style={s.reportsContainer}>
                <NestableDraggableFlatList
                  data={safeEmReports}
                  renderItem={renderEMReport}
                  keyExtractor={item => `${item._id.toString()}`}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  style={s.reportsList}
                  onDragEnd={reorderEMReports}
                />
              </View>
              <Divider
                note
                light
                subHeaderStyle={theme.text.small}
                text={
                  'Tapping a row generates the corresponding report and outputs it to the selected destination.'
                }
              />
            </>
          ) : (
            <Divider
              note
              light
              subHeaderStyle={{ textAlign: 'center' }}
              text={"Tap '+' to add a new report."}
            />
          )}
          <Divider
            text={'QR CODE REPORTS'}
            rightComponent={
              <Button
                buttonStyle={theme.styles.dividerIconButton}
                icon={<Plus color={theme.colors.screenHeaderButtonText} />}
                onPress={() =>
                  navigation.navigate('NewReportNavigator', {
                    screen: 'ReportScanCodesEditor',
                    params: {},
                  })
                }
              />
            }
          />
          {scReports.length ? (
            <>
              <View style={s.reportsContainer}>
                <NestableDraggableFlatList
                  data={safeScReports}
                  renderItem={renderSCReport}
                  keyExtractor={item => `${item._id.toString()}`}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  style={s.reportsList}
                  onDragEnd={reorderSCReports}
                />
              </View>
              <Divider
                note
                light
                subHeaderStyle={theme.text.small}
                text={
                  'Tapping a row generates the corresponding report and outputs it to the selected destination.'
                }
              />
            </>
          ) : (
            <Divider
              note
              light
              subHeaderStyle={{ textAlign: 'center' }}
              text={"Tap '+' to add a new report."}
            />
          )}
        </View>
      </NestableScrollContainer>
    </ListEditor>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  reportsContainer: {
    flex: 1,
  },
  newReport: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.clearButtonText,
  },
  reportInfoButton: {
    flexDirection: 'row',
  },
  reportsList: {
    overflow: 'visible',
  },
  shadow: {
    ...theme.shadow.glow,
    ...Platform.select({
      android: {
        borderRadius: 20,
      },
    }),
  },
}));

export default DatabaseReportingScreen;
