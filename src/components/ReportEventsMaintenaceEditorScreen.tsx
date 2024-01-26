import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ReportFiltersNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import { eqBoolean, eqString } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { filterSummary } from 'lib/filter';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ReportEventsMaintenanceEditor'>,
  NativeStackScreenProps<ReportFiltersNavigatorParamList>
>;

const ReportEventsMaintenanceEditorScreen = ({ navigation, route }: Props) => {
  const { reportId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const realm = useRealm();

  const report = useObject(EventsMaintenanceReport, new BSON.ObjectId(reportId));

  const [name, setName] = useState<string | undefined>(report?.name);
  const [ordinal, _setOrdinal] = useState<number>(report?.ordinal || 999);
  const [includesSummary, setIncludesSummary] = useState(report ? report.includesSummary : true);
  const [includesEvents, setIncludesEvents] = useState(report ? report.includesEvents : true);
  const [includesMaintenance, setIncludesMaintenance] = useState(report ? report.includesMaintenance : true);
  const [eventsFilter, setEventsFilter] = useState(report?.eventsFilter);
  const [maintenanceFilter, setMaintenanceFilter] = useState(report?.maintenanceFilter);

  useEffect(() => {
    event.on('events-report-filter-selection', onChangeEventsFilterSelection);
    event.on('maintenance-report-filter-selection', onChangeMaintenanceFilterSelection);
    event.on('report-filter', onChangeFilter);
    return () => {
      event.removeListener('events-report-filter-selection', onChangeEventsFilterSelection);
      event.removeListener('maintenance-report-filter-selection', onChangeMaintenanceFilterSelection);
      event.removeListener('report-filter', onChangeFilter);
    };
  }, []);

  const onChangeEventsFilterSelection = (filterId?: string) => {
    const filter = 
      (filterId && realm.objectForPrimaryKey('Filter', new BSON.ObjectId(filterId)) as Filter) || undefined;
    setEventsFilter(filter);

    // Update the exiting report immediately.
    if (report)  {
      realm.write(() => {
        report.eventsFilter = filter;
      });
    }
  };

  const onChangeMaintenanceFilterSelection = (filterId?: string) => {
    const filter = 
      (filterId && realm.objectForPrimaryKey('Filter', new BSON.ObjectId(filterId)) as Filter) || undefined;
    setMaintenanceFilter(filter);

    // Update the exiting report immediately.
    if (report)  {
      realm.write(() => {
        report.maintenanceFilter = filter;
      });
    }
  };

  const onChangeFilter = (filterId: string) => {
    // A filter change was made. Retrive the filter and if it's the selected
    // filter for this report then update our local state to force a render of
    // the filter summary.
    const changedFilter = realm.objectForPrimaryKey('Filter', new BSON.ObjectId(filterId)) as Filter;
    if (changedFilter.type === FilterType.ReportEventsFilter) {
      if (filterId === report?.eventsFilter?._id.toString()) {
        setEventsFilter(changedFilter);
      }
    } else {
      if (filterId === report?.maintenanceFilter?._id.toString()) {
        setMaintenanceFilter(changedFilter);
      }
    }
  };

  useEffect(() => {
    const canSave = !!name && (
      !eqString(report?.name, name) ||
      !eqBoolean(report?.includesSummary, includesSummary) ||
      !eqBoolean(report?.includesEvents, includesEvents) ||
      !eqBoolean(report?.includesMaintenance, includesMaintenance) ||
      !eqString(report?.eventsFilter?._id.toString(), eventsFilter?._id.toString()) ||
      !eqString(report?.maintenanceFilter?._id.toString(), maintenanceFilter?._id.toString())
    );

    const save = () => {
      if (reportId) {
        // Update existing report.
        realm.write(() => {
          report!.name = name!;
          report!.includesSummary = includesSummary;
          report!.includesEvents = includesEvents;
          report!.includesMaintenance = includesMaintenance;
          report!.eventsFilter = eventsFilter;
          report!.maintenanceFilter = maintenanceFilter;
        });
      } else {
        // Insert new report.
        realm.write(() => {
          realm.create('EventsMaintenanceReport', {
            name,
            ordinal,
            includesSummary,
            includesEvents,
            includesMaintenance,
            eventsFilter,
            maintenanceFilter,
          });
        });
      }
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
            onPress={navigation.goBack}
          />
        )
      },
      headerRight: () => {
        if (canSave) {
          return (
            <Button
              title={'Done'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.doneButton]}
              onPress={onDone}
            />
          )
        }
      },
    });
  }, [
    name,
    includesSummary,
    includesEvents,
    includesMaintenance,
    eventsFilter,
    maintenanceFilter,
  ]);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider text={'REPORT NAME'}/>
      <ListItemInput
        value={name}
        placeholder={'Report Name'}
        position={['first', 'last']}
        onChangeText={setName}
      /> 
      <Divider text={'CONTENTS'}/>
      <ListItemSwitch
        title={'Includes Summary'}
        value={includesSummary}
        position={['first', 'last']}
        onValueChange={setIncludesSummary}
      />
      <Divider />
      <ListItemSwitch
        title={'Includes Events'}
        value={includesEvents}
        position={includesEvents ? ['first'] : ['first', 'last']}
        onValueChange={setIncludesEvents}
        expanded={includesEvents}
        ExpandableComponent={
          <ListItem
            title={eventsFilter ? eventsFilter.name: 'No Filter Selected'}
            subtitle={eventsFilter ? filterSummary(eventsFilter) : 'Report will include all events.'}
            position={['last']}
            onPress={() => navigation.navigate('ReportFiltersNavigator', {
              screen: 'ReportFilters',
              params: { 
                filterType: FilterType.ReportEventsFilter,
                filterId: eventsFilter?._id.toString(),
                eventName: 'events-report-filter-selection',
              },
            })}
          />
        }
      />
      <Divider />
      <ListItemSwitch
        title={'Includes Maintenance'}
        value={includesMaintenance}
        position={includesMaintenance ? ['first'] : ['first', 'last']}
        onValueChange={setIncludesMaintenance}
        expanded={includesMaintenance}
        ExpandableComponent={
          <ListItem
            title={maintenanceFilter ? maintenanceFilter.name: 'No Filter Selected'}
            subtitle={maintenanceFilter ? filterSummary(maintenanceFilter) : 'Report will include all maintenance items.'}
            position={['last']}
            onPress={() => navigation.navigate('ReportFiltersNavigator', {
              screen: 'ReportFilters',
              params: { 
                filterType: FilterType.ReportMaintenanceFilter,
                filterId: maintenanceFilter?._id.toString(),
                eventName: 'maintenance-report-filter-selection',
              },
            })}
          />
        }
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default ReportEventsMaintenanceEditorScreen;
