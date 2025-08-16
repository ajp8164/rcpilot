import { ThemeManager, openShareSheet, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useQuery } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { EventRating } from 'components/molecules/EventRating';
import { rql } from 'components/molecules/filters';
import { batteryStatistics } from 'lib/battery';
import { batteryCycleStatisticsData } from 'lib/batteryCycle';
import { secondsToFormat } from 'lib/formatters';
import { Share } from 'lucide-react-native';
import { DateTime } from 'luxon';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  Text,
  View,
  ViewStyle,
} from 'react-native';
// import RNFetchBlob from 'rn-fetch-blob';
import ViewShot from 'react-native-view-shot';
import { BSON } from 'realm';
import { BatteryCycle } from 'realmdb';
import { Event } from 'realmdb/Event';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { ReportEventFilterValues } from 'types/filter';
import { ReportViewerNavigatorParamList } from 'types/navigation';

type ColumnDef = {
  field: string;
  headerName: string;
  style?: ViewStyle;
};

const columns: ColumnDef[] = [
  {
    field: 'number',
    headerName: 'No.',
    style: { width: 80, alignItems: 'center' },
  },
  { field: 'date', headerName: 'Date', style: { width: 175 } },
  { field: 'eventStyle', headerName: 'Style', style: { width: 150 } },
  { field: 'modelName', headerName: 'Model', style: { width: 100 } },
  { field: 'batteryName', headerName: 'Battery', style: { width: 200 } },
  {
    field: 'duration',
    headerName: 'Duration',
    style: { width: 80, alignItems: 'flex-end' },
  },
  {
    field: 'totalTime',
    headerName: 'Total Time',
    style: { width: 100, alignItems: 'flex-end' },
  },
  {
    field: 'outcome',
    headerName: 'Outcome',
    style: { width: 130, alignItems: 'center' },
  },
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

const ReportEventsMaintenanceViewerScreen = ({ route, navigation }: Props) => {
  const { reportId } = route.params;

  const theme = useTheme();
  const s = useStyles();

  const report = useObject(
    EventsMaintenanceReport,
    new BSON.ObjectId(reportId),
  );
  const values = report?.eventsFilter?.values as ReportEventFilterValues;
  const [rows, setRows] = useState<RowData[]>([]);

  const events = useQuery<Event>('Event', events => {
    const query = rql()
      .and('model._id', values?.model)
      .and('model.type', values?.modelType)
      .and('model.category._id', values?.category)
      .and('date', values?.date)
      .and('duration', values?.duration)
      .and('pilot._id', values?.pilot)
      .and('location._id', values?.location)
      .and('eventStyle._id', values?.eventStyle)
      .and('outcome', values?.outcome)
      .string();
    return query ? events.filtered(query).sorted(['number']) : events;
  });

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

  // Create report rows from the database query.
  useEffect(() => {
    (async () => {
      const rows = events.map(e => {
        return {
          number: `${e.number}/${e.model.statistics.totalEvents}`,
          date: `${DateTime.fromISO(e.date).toFormat('M/d/yyyy h:mm a')}`,
          eventStyle: `${e.eventStyle || '---'}`,
          modelName: `${e.model.name}`,
          batteryName: `${batteryCycleInfo(e.batteryCycles)}`,
          duration: `${secondsToFormat(e.duration, { format: "m'm' s's'" })}`,
          totalTime: `${secondsToFormat(e.model.statistics.totalTime, { format: "h'h' m'm' s's'" })}`,
          outcome: <EventRating value={e.outcome} />,
          operatorName: `${e.pilot.name}`,
          notes: `${e.notes}`,
        };
      });

      setRows(rows);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const batteryCycleInfo = (cycles: BatteryCycle[]) => {
    let result: string | undefined;

    cycles.forEach(cycle => {
      const name = cycle.battery.name || '---';
      const cycleNo = cycle.battery.name
        ? 'Cycle ' + cycle.cycleNumber + ':'
        : undefined;
      const adc1 = cycle.battery
        ? batteryStatistics(cycle.battery)?.string.averageDischargeCurrent
        : '?';
      const adc2 = cycle.battery
        ? batteryCycleStatisticsData(cycle).string.averageDischargeCurrent + 'C'
        : '?';
      const d80 = cycle.battery
        ? batteryCycleStatisticsData(cycle).string.dischargeBy80Percent
        : '?';

      const cycleInfo = `${name}\n${cycleNo ? cycleNo : ''}\n${cycleNo ? adc1 : ''}\n${cycleNo ? adc2 : ''}\n${cycleNo ? d80 : ''}`;
      if (result) {
        result = `${result}\n\n${cycleInfo}`;
      } else {
        result = cycleInfo;
      }
    });

    return result || '';
  };

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
        {columns.map((col, index) => {
          // Value is a string or react node.
          const value = row[col.field as keyof RowData];
          return (
            <View
              key={`${index}`}
              style={[col.style, index % 2 === 1 ? s.striped : {}]}>
              {typeof value === 'string' ? (
                <Text style={[s.cell, s.text]}>{value}</Text>
              ) : (
                value
              )}
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
      <ViewShot
        ref={viewShotRef}
        style={s.container}
        onCapture={onCapture}
        options={{ width: 1650 }}>
        <View style={s.reportHeader}>
          <Text style={theme.text.h5}>{'Event/Maintenance Report'}</Text>
          <Text style={theme.text.normal}>
            {DateTime.now().toFormat("MMMM dd, yyyy 'at' h:m a")}
          </Text>
        </View>
        <FlatList
          data={rows}
          renderItem={renderRow}
          keyExtractor={item => item.number.toString()}
          ListHeaderComponent={
            <View style={s.header}>
              {columns.map((col, index) => {
                return (
                  <View key={`${index}`} style={col.style}>
                    <Text style={[s.cell, s.headerText]} numberOfLines={1}>
                      {col.headerName}
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

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    padding: 15,
    width: 1650,
  },
  reportHeader: {
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: theme.colors.brandPrimary,
    paddingVertical: 5,
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
    ...theme.text.normal,
    fontFamily: theme.fonts.bold,
    color: theme.colors.stickyWhite,
  },
  text: {
    ...theme.text.normal,
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
