import { AppTheme, useTheme } from 'theme';
import { rql } from 'components/molecules/filters';
import { ScrollView, Text, View } from 'react-native';
import { useObject, useQuery, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { EmptyView } from 'components/molecules/EmptyView';
import { Event } from 'realmdb/Event';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ReportViewerNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { viewport } from '@react-native-ajp-elements/ui';
import { ReportEventFilterValues } from 'types/filter';

export type Props = NativeStackScreenProps<
  ReportViewerNavigatorParamList,
  'ReportEventsMaintenanceViewer'
>;

const ReportEventsMaintenanceViewerScreen = ({ route, navigation: _navigation }: Props) => {
  const { reportId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);

  const _realm = useRealm();
  const report = useObject(EventsMaintenanceReport, new BSON.ObjectId(reportId));

  const emValues = report?.eventsFilter?.values as ReportEventFilterValues;

  const events = useQuery<Event>('Event', events => {
    const query = rql()
      .and('model._id', emValues.model)
      .and('model.type', emValues.modelType)
      .and('model.category._id', emValues.category)
      .and('date', emValues.date)
      .and('duration', emValues.duration)
      .and('pilot._id', emValues.pilot)
      .and('location._id', emValues.location)
      .and('eventStyle._id', emValues.eventStyle)
      .and('outcome', emValues.outcome)
      .string();

    let r;
    if (query) {
      r = events.filtered(query).sorted(['number']);
    } else {
      r = events;
    }
    return r.sorted(['date', 'model.name']);
  });

  if (!report) {
    return <EmptyView error message={'Report Not Found!'} />;
  }

  return (
    <ScrollView style={s.container}>
      <Text>{report?.name}</Text>
      {events.map((e, i) => {
        return (
          <View key={`${i}`}>
            <Text>{'Created on: ' + e.createdOn}</Text>
            <Text>{'Updated on: ' + e.updatedOn}</Text>
            <Text>{'Event number: ' + e.number}</Text>
            <Text>{'Date: ' + e.date}</Text>
            <Text>{'Model Name: ' + e.model.name}</Text>
            <Text>{'Pilot name: ' + e.pilot.name}</Text>
            <Text>{'Location name: ' + e.location?.name}</Text>
            <Text>{'Duration: ' + e.duration}</Text>
            <Text>{'Style name: ' + e.eventStyle?.name}</Text>
            <Text>{'Outcome: ' + e.outcome}</Text>
            <Text>{'Battery cycles: ' + e.batteryCycles.length}</Text>
            <Text>{'Fuel name: ' + e.fuel?.name}</Text>
            <Text>{'Fuel consumed: ' + e.fuelConsumed}</Text>
            <Text>{'Propeller name: ' + e.propeller?.name}</Text>
            <Text>{'Notes: ' + e.notes}</Text>
            <Text />
          </View>
        );
      })}
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  container: {
    width: viewport.width,
    // height: (viewport.width * 8.5) / 11,
    borderWidth: 1,
  },
}));

export default ReportEventsMaintenanceViewerScreen;
