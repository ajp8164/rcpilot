import { AppTheme, useTheme } from 'theme';
import { rql } from 'components/molecules/filters';
import { FlatList, ListRenderItem, ScrollView, Text, View, ViewStyle } from 'react-native';
import { useObject, useQuery } from '@realm/react';

import { BSON } from 'realm';
import { EmptyView } from 'components/molecules/EmptyView';
import { Event } from 'realmdb/Event';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { ReactNode, useEffect, useState } from 'react';
import { ReportViewerNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { openShareSheet } from '@react-native-ajp-elements/ui';
import { ReportEventFilterValues } from 'types/filter';
import { DateTime } from 'luxon';
import { batteryCycleStatisticsData } from 'lib/batteryCycle';
import { batteryStatistics } from 'lib/battery';
// import RNFetchBlob from 'rn-fetch-blob';
import ViewShot from 'react-native-view-shot';
import { secondsToFormat } from 'lib/formatters';
import { EventRating } from 'components/molecules/EventRating';

type ColumnDef = {
  field: string;
  headerName: string;
  style?: ViewStyle;
};

const columns: ColumnDef[] = [
  { field: 'number', headerName: 'No.', style: { width: 80, alignItems: 'center' } },
  { field: 'date', headerName: 'Date', style: { width: 175 } },
  { field: 'eventStyle', headerName: 'Style', style: { width: 150 } },
  { field: 'modelName', headerName: 'Model', style: { width: 100 } },
  { field: 'batteryName', headerName: 'Battery', style: { width: 100 } },
  { field: 'duration', headerName: 'Duration', style: { width: 80, alignItems: 'flex-end' } },
  { field: 'totalTime', headerName: 'Total Time', style: { width: 100, alignItems: 'flex-end' } },
  { field: 'outcome', headerName: 'Outcome', style: { width: 100, alignItems: 'center' } },
  { field: 'operatorName', headerName: 'Name', style: { width: 200 } },
  { field: 'notes', headerName: 'Notes', style: { width: 400 } },
];

type RowData = {
  number: string;
  date: string;
  eventStyle: string;
  modelName: string;
  batteryName: string;
  duration: string;
  totalTime: string;
  outcome: string | ReactNode;
  operatorName: string;
  notes: string;
};

export type Props = NativeStackScreenProps<
  ReportViewerNavigatorParamList,
  'ReportEventsMaintenanceViewer'
>;

const ReportEventsMaintenanceViewerScreen = ({ route, navigation: _navigation }: Props) => {
  const { reportId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);

  const report = useObject(EventsMaintenanceReport, new BSON.ObjectId(reportId));
  const values = report?.eventsFilter?.values as ReportEventFilterValues;
  const [rows, setRows] = useState<RowData[]>([]);

  const events = useQuery<Event>('Event', events => {
    const query = rql()
      .and('model._id', values.model)
      .and('model.type', values.modelType)
      .and('model.category._id', values.category)
      .and('date', values.date)
      .and('duration', values.duration)
      .and('pilot._id', values.pilot)
      .and('location._id', values.location)
      .and('eventStyle._id', values.eventStyle)
      .and('outcome', values.outcome)
      .string();
    return query ? events.filtered(query).sorted(['number']) : events;
  });

  // Create report rows from the database query.
  useEffect(() => {
    (async () => {
      const rows = events.map(e => {
        return {
          number: `${e.number}/${e.model.statistics.totalEvents}`,
          date: `${DateTime.fromISO(e.date).toFormat('M/d/yyyy h:mm a')}`,
          eventStyle: `${e.eventStyle || '---'}`,
          modelName: `${e.model.name}`,
          batteryName: `
            ${e.batteryCycles[0]?.battery.name || '---'}
            ${
              e.batteryCycles[0]?.battery.name
                ? 'Cycle ' + e.batteryCycles[0]?.cycleNumber + ':' + e.batteryCycles[0]?.battery
                  ? batteryStatistics(e.batteryCycles[0]?.battery)?.string.averageDischargeCurrent
                  : '?' + e.batteryCycles[0]?.battery
                    ? batteryCycleStatisticsData(e.batteryCycles[0]).string.averageDischargeCurrent
                    : '?' + 'C' + e.batteryCycles[0]?.battery
                      ? batteryCycleStatisticsData(e.batteryCycles[0]).string.dischargeBy80Percent
                      : '?'
                : ''
            }
          `,
          duration: `${secondsToFormat(e.duration, { format: 'm:ss' })}`,
          totalTime: `${secondsToFormat(e.model.statistics.totalTime, { format: 'h:mm:ss' })}`,
          outcome: <EventRating style={s.outcome} value={e.outcome} />,
          operatorName: `${e.pilot.name}`,
          notes: `${e.notes}`,
        };
      });

      setRows(rows);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const onCapture = (url: string) => {
    openShareSheet({
      title: 'Event/Maintenance Report',
      message: '',
      subject: 'Event/Maintenance Report',
      email: '',
      url,
    });
  };

  const renderRow: ListRenderItem<RowData> = ({ item: row, index }) => {
    return (
      <View key={`${index}`} style={s.row}>
        {columns.map(c => {
          // Value is a string or react node.
          const value = row[c.field as keyof RowData];
          return (
            <View style={[c.style, index % 2 === 1 ? s.striped : {}]}>
              {typeof value === 'string' ? <Text style={[s.cell, s.text]}>{value}</Text> : value}
            </View>
          );
        })}
      </View>
    );
  };

  if (!report) {
    return <EmptyView error message={'Report Not Found!'} />;
  }

  return (
    <ScrollView horizontal={true}>
      <ViewShot style={s.container} onCapture={onCapture} captureMode={'mount'}>
        <FlatList
          data={rows}
          renderItem={renderRow}
          keyExtractor={item => item.number.toString()}
          ListHeaderComponent={
            <View style={s.header}>
              {columns.map(c => {
                return (
                  <View style={c.style}>
                    <Text style={[s.cell, s.headerText]} numberOfLines={1}>
                      {c.headerName}
                    </Text>
                  </View>
                );
              })}
            </View>
          }
        />
      </ViewShot>
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: theme.colors.brandPrimary,
  },
  row: {
    flexDirection: 'row',
  },
  striped: {
    backgroundColor: theme.colors.subtleGray,
  },
  cell: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  headerText: {
    ...theme.styles.textNormal,
    ...theme.styles.textBold,
    color: theme.colors.stickyWhite,
  },
  text: {
    ...theme.styles.textNormal,
  },
  outcome: {
    marginTop: 5,
  },
}));

export default ReportEventsMaintenanceViewerScreen;

// const dirs = RNFetchBlob.fs.dirs;
// const filename = 'event-maintenance-report.html';
// const path = `${Platform.OS === 'android' ? dirs.DownloadDir : dirs.DocumentDir}/${filename}`;

// RNFetchBlob.fs.writeFile(path, html).then(() => {
//   openShareSheet({
//     title: 'Event/Maintenance Report',
//     message: '',
//     subject: 'Event/Maintenance Report',
//     email: '',
//     url: file.filePath,
//   });
// });
