import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import {
  DragEndParams,
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams
} from 'react-native-draggable-flatlist';
import { ListItem, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import { NewReportNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import { OutputReportTo, OutputReportToDescription, ReportType } from 'types/database';
import { Platform, Pressable, View } from 'react-native';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import { CompositeScreenProps } from '@react-navigation/core';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScanCodesReport } from 'realmdb/ScanCodesReport';
import { makeStyles } from '@rneui/themed';
import { saveOutputReportTo } from 'store/slices/appSettings';
import { selectOutputReportTo } from 'store/selectors/appSettingsSelectors';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useConfirmAction } from 'lib/useConfirmAction';
import { useEvent } from 'lib/event';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'DatabaseReporting'>,
  NativeStackScreenProps<NewReportNavigatorParamList, 'ReportEventsMaintenanceEditor'>
>;

type Report = EventsMaintenanceReport | ScanCodesReport;

// Destination report editor based on report type.
const reportEditor: {[key in ReportType]: any} = {
  [ReportType.EventsMaintenance]: 'ReportEventsMaintenanceEditor',
  [ReportType.ScanCodes]: 'ReportScanCodesEditor',
};

const reportViewer: {[key in ReportType]: any} = {
  [ReportType.EventsMaintenance]: 'ReportEventsMaintenanceViewer',
  [ReportType.ScanCodes]: 'ReportScanCodesViewer',
};

const DatabaseReportingScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const { showActionSheetWithOptions } = useActionSheet();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const event = useEvent();

  const outputReportTo = useSelector(selectOutputReportTo);

  const realm = useRealm();
  const emReports = useQuery<EventsMaintenanceReport>('EventsMaintenanceReport');
  const scReports = useQuery<ScanCodesReport>('ScanCodesReport');

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (!emReports.length && !scReports.length) {
          return null;
        }
        return (
          <Button
            title={listEditor.enabled ? 'Done' : 'Edit'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            onPress={listEditor.onEdit}
          />
        )
      },
    });
  }, [ listEditor.enabled, emReports, scReports ]);

  useEffect(() => {
    event.on('output-report-to', setOutputReportTo);
    // event.on('events-maintenace-report', );
    // event.on('scan-codes-report', );
    return () => {
      event.removeListener('ouput-report-to', setOutputReportTo);
      // event.removeListener('events-maintenace-report', );
      // event.removeListener('scan-codes-report', );
    };
  }, []);

  const setOutputReportTo = (result: EnumPickerResult) => {
    dispatch(saveOutputReportTo({ value: result.value[0] as OutputReportTo}));
  };

  const reorderReports = (params: DragEndParams<Report>) => {
    const { data } = params;
    realm.write(() => {
      data.forEach((report, index) => {
        report.ordinal = index;
      });
    });
  };

  const emReportSummary = (report: EventsMaintenanceReport) => {
    const whichEvents = report.eventsFilter ? `"${report.eventsFilter.name}" filter` : 'All';
    const whichMaintenance = report.maintenanceFilter ? `"${report.maintenanceFilter.name}" filter` : 'All';
    const summary = report.includesSummary ? 'Summary, ' : '';
    const events = report.includesEvents ? `Events: ${whichEvents}, ` : '';
    const maintenance = report.includesMaintenance ? `Maintenance: ${whichMaintenance}` : '';
    return `${summary}${events}${maintenance}`.replace(/,\s*$/, '') || 'Report is empty';
  };

  const scReportSummary = (report: ScanCodesReport) => {
    const whichEvents = report.batteryScanCodesFilter ? `"${report.batteryScanCodesFilter.name}" filter` : 'All';
    const whichMaintenance = report.modelScanCodesFilter ? `"${report.modelScanCodesFilter.name}" filter` : 'All';
    const events = report.includesBatteries ? `Batteries: ${whichEvents}, ` : '';
    const maintenance = report.includesModels ? `Models: ${whichMaintenance}` : '';
    return `${events}${maintenance}`.replace(/,\s*$/, '') || 'Report is empty';
  };

  const addReport = () => {
    showActionSheetWithOptions(
      {
        options: ['Event/Maintenance Log', 'QR Codes', 'Cancel'],
        cancelButtonIndex: 2,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            navigation.navigate('NewReportNavigator', {
              screen: 'ReportEventsMaintenanceEditor',
              params: {},
            });
          break;
          case 1:
            navigation.navigate('NewReportNavigator', {
              screen: 'ReportScanCodesEditor',
              params: {},
            });
          break;
          default:
            break;
        }
      },
    );
  };

  const deleteReport = (report: Report) => {
    realm.write(() => {
      realm.delete(report);
    });
  };

  const renderReport = (props: {
    report: Report,
    reportType: ReportType,
    reportCount: number,
    reportSummary: string;
    index: number,
    drag: () => void,
    isActive: boolean,
  }) => {
    const {
      report,
      reportType,
      reportCount,
      reportSummary,
      index,
      drag,
      isActive
    } = props;
    return (
      <View
        key={index}
        style={[isActive ? s.shadow : {}]}>
        <ListItem
          ref={ref => ref && listEditor.add(ref, reportType, report._id.toString())}
          title={report.name}
          subtitle={reportSummary}
          subtitleNumberOfLines={1}
          position={listItemPosition(index, reportCount)}
          titleNumberOfLines={1}
          drag={drag}
          editable={{
            item: {
              icon: 'remove-circle',
              color: theme.colors.assertive,
              action: 'open-swipeable',
            },
            reorder: true,
          }}
          showEditor={listEditor.show}
          swipeable={{
            rightItems: [{
              ...swipeableDeleteItem[theme.mode],
              onPress: () => confirmAction(deleteReport, {
                label: 'Delete Report',
                title: 'This action cannot be undone.\nAre you sure you want to delete this report?',
                value: report,
              })
            }]
          }}
          onSwipeableWillOpen={() => listEditor.onItemWillOpen(reportType, report._id.toString())}
          onSwipeableWillClose={listEditor.onItemWillClose}
          rightImage={
            <Pressable
              style={{flexDirection: 'row'}}
              onPress={() => navigation.navigate(reportEditor[reportType], {
                reportId: report._id.toString(),
              })}>
              <CustomIcon
                name={'circle-info'}
                size={22}
                color={theme.colors.clearButtonText}
              />
            </Pressable>
          }
          onPress={() => navigation.navigate('ReportViewerNavigator', {
            screen: reportViewer[reportType],
            params: {
              reportId: report._id.toString(),
            }
          })}
        />
      </View>
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
      isActive
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
      isActive
    });
  };

  return (
    <NestableScrollContainer
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider text={'DESTINATION'}/>
      <ListItem
        title={'Output Report To'}
        value={outputReportTo}
        position={['first', 'last']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Output To',
          footer: 'Specifies the destination for database report output.',
          values: Object.values(OutputReportTo),
          selected: outputReportTo,
          eventName: 'output-report-to',
        })}
      />
      <Divider type={'note'} text={
        OutputReportToDescription[
          Object.keys(OutputReportTo)[Object.values(OutputReportTo).indexOf(outputReportTo)] as keyof typeof OutputReportToDescription
        ]
      }/>
      <ListItem
        title={'Add a New Report'}
        titleStyle={s.newReport}
        position={['first', 'last']}
        rightImage={false}
        onPress={addReport}
      />
      {emReports.length ?
        <>
          <Divider text={'EVENT/MAINTENANCE LOG REPORTS'}/>
          <View style={{flex:1}}>
            <NestableDraggableFlatList
              // @ts-expect-error: typing seems incorrect on renderItem
              data={emReports.sorted('ordinal')}
              renderItem={renderEMReport}
              keyExtractor={(_item, index) => `${index}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              style={s.reportsList}
              animationConfig={{
                damping: 20,
                mass: 0.01,
                stiffness: 100,
                overshootClamping: false,
                restSpeedThreshold: 0.2,
                restDisplacementThreshold: 2,
              }}
              onDragEnd={reorderReports}
            />
          </View>
          <Divider type={'note'} text={'Tapping a row generates the corresponding report and outputs it to the selected destination.'}/>
        </>
        : null
      }
      {scReports.length ?
        <>
          <Divider text={'QR CODE REPORTS'}/>
          <View style={{flex:1}}>
            <NestableDraggableFlatList
              // @ts-expect-error: typing seems incorrect on renderItem
              data={scReports.sorted('ordinal')}
              renderItem={renderSCReport}
              keyExtractor={(_item, index) => `${index}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              style={s.reportsList}
              animationConfig={{
                damping: 20,
                mass: 0.01,
                stiffness: 100,
                overshootClamping: false,
                restSpeedThreshold: 0.2,
                restDisplacementThreshold: 2,
              }}
              onDragEnd={reorderReports}
            />
          </View>
          <Divider type={'note'} text={'Tapping a row generates the corresponding report and outputs it to the selected destination.'}/>
        </>
        : null
      }
    </NestableScrollContainer>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  newReport: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.clearButtonText,
  },
  reportsList: {
    overflow: 'visible',
  },
  shadow: {
    ...theme.styles.shadowGlow,
    ...Platform.select({
      android: {
        borderRadius: 20,
      },
    }),
  },
}));

export default DatabaseReportingScreen;
