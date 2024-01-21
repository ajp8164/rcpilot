import { AppTheme, useTheme } from 'theme';
import {
  DragEndParams,
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams
} from 'react-native-draggable-flatlist';
import { OutputReportTo, OutputReportToDescription, ReportType } from 'types/database';
import { Platform, Pressable, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { ActionSheet } from 'react-native-ui-lib';
import { Button } from '@rneui/base';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScanCodesReport } from 'realmdb/ScanCodesReport';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { saveOutputReportTo } from 'store/slices/appSettings';
import { selectOutputReportTo } from 'store/selectors/appSettingsSelectors';
import { useEvent } from 'lib/event';
import { useSetState } from '@react-native-ajp-elements/core';

type Report = EventsMaintenanceReport | ScanCodesReport;

// Destination report editor based on report type.
const reportEditor: {[key in ReportType]: any} = {
  [ReportType.EventsMaintenance]: 'ReportEventsMaintenanceEditor',
  [ReportType.ScanCodes]: 'ReportScanCodesEditor',
};

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'DatabaseReporting'>;

const DatabaseReportingScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const dispatch = useDispatch();
  const event = useEvent();

  const outputReportTo = useSelector(selectOutputReportTo);

  const realm = useRealm();
  const emReports = useQuery<EventsMaintenanceReport>('EventsMaintenanceReport');
  const scReports = useQuery<ScanCodesReport>('ScanCodesReport');

  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [newReportSheetVisible, setNewReportSheetVisible] = useState(false);

  const [reports, _setReports] = useSetState({
    [ReportType.EventsMaintenance]: emReports,
    [ReportType.ScanCodes]: scReports,
  });

  useEffect(() => {
    const onEdit = () => {
      setEditModeEnabled(!editModeEnabled);
    };

    navigation.setOptions({
      headerRight: () => {
        if (!reports[ReportType.EventsMaintenance].length &&
          !reports[ReportType.ScanCodes].length) {
          return null;
        }
        return (
          <Button
            title={editModeEnabled ? 'Done' : 'Edit'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.doneButton]}
            onPress={onEdit}
          />
        )
      },
    });
  }, [ editModeEnabled, reports[ReportType.EventsMaintenance], reports[ReportType.ScanCodes] ]);

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

  const setOutputReportTo = (value: OutputReportTo) => {
    dispatch(saveOutputReportTo({ value }));
  };

  const deleteReport = (report: Report) => {
    realm.write(() => {
      realm.delete(report);
    });
  };

  const reorderReports = (params: DragEndParams<Report>) => {
    const { data } = params;
    realm.write(() => {
      for (let i = 0; i < data.length; i++) {
        data[i].ordinal = i;
      };
    });
  };

  const reportToString = (report: Report) => {
    return report._id.toString();
  };

  const renderReport = (props: {
    report: Report,
    reportType: ReportType,
    reportCount: number,
    index: number,
    drag: () => void,
    isActive: boolean,
  }) => {
    const { report, reportType, reportCount, index, drag, isActive } = props;
    return (
      <View
        key={index}
        style={[isActive ? s.shadow : {}]}>
        <ListItem
          title={report.name}
          subtitle={reportToString(report as Report)}
          subtitleNumberOfLines={1}
          position={reportCount === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === reportCount - 1 ? ['last'] : []}
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
          showEditor={editModeEnabled}
          swipeable={{
            rightItems: [{
              icon: 'delete',
              text: 'Delete',
              color: theme.colors.assertive,
              x: 64,
              onPress: () => deleteReport(report),
            }]
          }}
          rightImage={
            <Pressable
              style={{flexDirection: 'row'}}
              onPress={() => navigation.navigate(reportEditor[reportType])}
              >
              <CustomIcon
                name={'circle-info'}
                size={22}
                color={theme.colors.screenHeaderBackButton}
              />
            </Pressable>
          }
          // TODO = press runs the report...
          // onPress={() => navigation.navigate('ReportEditor', {
          //   reportId: report._id,
          //   eventName: 'report',
          // })}
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
      reportCount: reports[ReportType.EventsMaintenance].length,
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
      reportCount: reports[ReportType.ScanCodes].length,
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
        onPress={() => setNewReportSheetVisible(true)}
      />
      {reports[ReportType.EventsMaintenance].length ?
        <>
          <Divider text={'EVENT/MAINTENANCE LOG REPORTS'}/>
          <View style={{flex:1}}>
            <NestableDraggableFlatList
              // @ts-expect-error Typing is incorrect on renderItem
              data={reports[ReportType.EventsMaintenance].sorted('ordinal')}
              renderItem={renderEMReport}
              keyExtractor={(item) => `${item._id}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              style={s.reportsList}
              containerStyle={s.swipeableListMask}
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
      {reports[ReportType.ScanCodes].length ?
        <>
          <Divider text={'QR CODE REPORTS'}/>
          <View style={{flex:1}}>
            <NestableDraggableFlatList
              // @ts-expect-error Typing is incorrect on renderItem
              data={reports[ReportType.ScanCodes].sorted('ordinal')}
              renderItem={renderSCReport}
              keyExtractor={(item) => `${item._id}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              style={s.reportsList}
              containerStyle={s.swipeableListMask}
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
      <ActionSheet
        cancelButtonIndex={2}
        options={[
          {
            label: 'Event/Maintenance Log',
            onPress: () => {
              navigation.navigate('ReportEventsMaintenanceEditor', {});
              setNewReportSheetVisible(false);
            }
          },
          {
            label: 'QR Codes',
            onPress: () => {
              navigation.navigate('ReportScanCodesEditor', {});
              setNewReportSheetVisible(false);
            }
          },
          {
            label: 'Cancel',
            onPress: () => setNewReportSheetVisible(false),
          },
        ]}
        useNativeIOS={true}
        visible={newReportSheetVisible}
      />
    </NestableScrollContainer>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  newReport: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton,
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
  swipeableListMask: {
    borderRadius: 10,
    overflow: 'hidden',
  },
}));

export default DatabaseReportingScreen;
