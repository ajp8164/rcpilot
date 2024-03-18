import { AppTheme, useTheme } from 'theme';
import {
  BooleanRelation,
  DateRelation,
  EnumRelation,
  NumberRelation,
  StringRelation,
} from 'components/molecules/filters';
import { Text, View } from 'react-native';
import { useObject, useQuery, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { EmptyView } from 'components/molecules/EmptyView';
import { Event } from 'realmdb/Event';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ReportViewerNavigatorParamList } from 'types/navigation';
import ViewShot from 'react-native-view-shot';
import { makeStyles } from '@rneui/themed';
import { viewport } from '@react-native-ajp-elements/ui';

export type Props = NativeStackScreenProps<
  ReportViewerNavigatorParamList,
  'ReportEventsMaintenanceViewer'
>;

const ReportEventsMaintenanceViewerScreen = ({ route, navigation }: Props) => {
  const { reportId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();
  const report = useObject(EventsMaintenanceReport, new BSON.ObjectId(reportId));

  const emValues = report?.eventsFilter?.values as EventReportFilterValues;

  // todo Any
  const queryRelationMap: Record<string, string> = {
    [BooleanRelation.No]: '!=',
    [BooleanRelation.Yes]: '==',
    [EnumRelation.Is]: '==',
    [EnumRelation.IsNot]: '!=',
    [DateRelation.After]: '>',
    [DateRelation.Before]: '<',
    [DateRelation.Past]: '>=',
    [NumberRelation.EQ]: '==',
    [NumberRelation.GT]: '>',
    [NumberRelation.LT]: '<',
    [NumberRelation.NE]: '!=',
    [StringRelation.Contains]: 'CONTAINS[c]',
    [StringRelation.Missing]: '',
  };

  const events = useQuery<Event>('Event', event => {
    return event
      .filtered(
        `model ${queryRelationMap[emValues.model.relation]} $0` +
          ' AND ' +
          `modelType ${queryRelationMap[emValues.modelType.relation]} $1` +
          ' AND ' +
          `category ${queryRelationMap[emValues.category.relation]} $2` +
          ' AND ' +
          `date ${queryRelationMap[emValues.date.relation]} $3` +
          ' AND ' +
          `duration ${queryRelationMap[emValues.duration.relation]} $4` +
          ' AND ' +
          `pilot ${queryRelationMap[emValues.pilot.relation]} $5` +
          ' AND ' +
          `location ${queryRelationMap[emValues.location.relation]} $6` +
          ' AND ' +
          `modelStyle ${queryRelationMap[emValues.modelStyle.relation]} $7` +
          ' AND ' +
          `outcome ${queryRelationMap[emValues.outcome.relation]} $8`,
        emValues.model.value[0],
        emValues.modelType.value[0],
        emValues.category.value[0],
        emValues.date.value[0],
        emValues.duration.value[0],
        emValues.pilot.value[0],
        emValues.location.value[0],
        emValues.modelStyle.value[0],
        emValues.outcome.value[0],
      )
      .sorted(['date', 'model.name']);
  });

  if (!report) {
    return <EmptyView error message={'Report Not Found!'} />;
  }

  return (
    <ViewShot options={{ fileName: 'em-report', format: 'png', quality: 0.9 }} style={s.container}>
      <Text>{report?.name}</Text>
    </ViewShot>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  container: {
    width: viewport.width,
    height: (viewport.width * 8.5) / 11,
    borderWidth: 1,
  },
}));

export default ReportEventsMaintenanceViewerScreen;
