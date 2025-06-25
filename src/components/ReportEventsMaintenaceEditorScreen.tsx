import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useRef, useState } from 'react';
import { eqBoolean, eqString } from 'realmdb/helpers';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Divider } from '@react-native-ajp-elements/ui';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { filterSummary } from 'lib/filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useSelector } from 'react-redux';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'ReportEventsMaintenanceEditor'
>;

const ReportEventsMaintenanceEditorScreen = ({ navigation, route }: Props) => {
  const { reportId } = route.params;

  const theme = useTheme();
  const setDebounced = useDebouncedRender();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();

  const report = useObject(
    EventsMaintenanceReport,
    new BSON.ObjectId(reportId),
  );
  const reportEventsFilterId = useSelector(
    selectFilters(FilterType.ReportEventsFilter),
  );
  const reportMaintenanceFilterId = useSelector(
    selectFilters(FilterType.ReportMaintenanceFilter),
  );

  const name = useRef<string | undefined>(report?.name);
  const [ordinal, _setOrdinal] = useState<number>(report?.ordinal || 999);
  const [includesSummary, setIncludesSummary] = useState(
    report ? report.includesSummary : true,
  );
  const [includesEvents, setIncludesEvents] = useState(
    report ? report.includesEvents : true,
  );
  const [includesMaintenance, setIncludesMaintenance] = useState(
    report ? report.includesMaintenance : true,
  );
  const [eventsFilter, setEventsFilter] = useState(report?.eventsFilter);
  const [maintenanceFilter, setMaintenanceFilter] = useState(
    report?.maintenanceFilter,
  );

  useEffect(() => {
    const filter = realm.objectForPrimaryKey(
      'Filter',
      new BSON.ObjectId(reportEventsFilterId),
    ) as Filter;
    setEventsFilter(filter);

    // Update the exiting report immediately.
    if (report) {
      realm.write(() => {
        report.eventsFilter = filter;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportEventsFilterId]);

  useEffect(() => {
    const filter = realm.objectForPrimaryKey(
      'Filter',
      new BSON.ObjectId(reportMaintenanceFilterId),
    ) as Filter;
    setMaintenanceFilter(filter);

    // Update the exiting report immediately.
    if (report) {
      realm.write(() => {
        report.maintenanceFilter = filter;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportMaintenanceFilterId]);

  useEffect(() => {
    const canSave =
      !!name.current &&
      (!eqString(report?.name, name.current) ||
        !eqBoolean(report?.includesSummary, includesSummary) ||
        !eqBoolean(report?.includesEvents, includesEvents) ||
        !eqBoolean(report?.includesMaintenance, includesMaintenance) ||
        !eqString(
          report?.eventsFilter?._id.toString(),
          eventsFilter?._id.toString(),
        ) ||
        !eqString(
          report?.maintenanceFilter?._id.toString(),
          maintenanceFilter?._id.toString(),
        ));

    const save = () => {
      if (reportId) {
        // Update existing report.
        if (report) {
          realm.write(() => {
            report.name = name.current || 'no-name';
            report.includesSummary = includesSummary;
            report.includesEvents = includesEvents;
            report.includesMaintenance = includesMaintenance;
            report.eventsFilter = eventsFilter;
            report.maintenanceFilter = maintenanceFilter;
          });
        }
      } else {
        // Insert new report.
        realm.write(() => {
          realm.create('EventsMaintenanceReport', {
            name: name.current,
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

    setScreenEditHeader(
      { enabled: canSave, action: onDone },
      { visible: !reportId },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    name.current,
    includesSummary,
    includesEvents,
    includesMaintenance,
    eventsFilter,
    maintenanceFilter,
  ]);

  return (
    <ScrollView style={theme.styles.view}>
      <Divider text={'REPORT NAME'} />
      <ListItemInput
        value={name.current}
        placeholder={'Report Name'}
        position={['first', 'last']}
        onChangeText={value => setDebounced(() => (name.current = value))}
      />
      <Divider text={'CONTENTS'} />
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
            title={eventsFilter ? eventsFilter.name : 'No Filter Selected'}
            subtitle={
              eventsFilter
                ? filterSummary(eventsFilter)
                : 'Report will include all events.'
            }
            position={['last']}
            onPress={() =>
              navigation.navigate('ReportEventFiltersNavigator', {
                screen: 'ReportEventFilters',
                params: {
                  filterType: FilterType.ReportEventsFilter,
                },
              })
            }
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
            title={
              maintenanceFilter ? maintenanceFilter.name : 'No Filter Selected'
            }
            subtitle={
              maintenanceFilter
                ? filterSummary(maintenanceFilter)
                : 'Report will include all maintenance items.'
            }
            position={['last']}
            onPress={() =>
              navigation.navigate('ReportMaintenanceFiltersNavigator', {
                screen: 'ReportMaintenanceFilters',
                params: {
                  filterType: FilterType.ReportMaintenanceFilter,
                },
              })
            }
          />
        }
      />
    </ScrollView>
  );
};

export default ReportEventsMaintenanceEditorScreen;
