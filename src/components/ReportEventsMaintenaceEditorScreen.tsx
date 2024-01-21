import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ReportFiltersNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { FilterType } from 'types/filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eqString } from 'realmdb/helpers';
import { makeStyles } from '@rneui/themed';

// import { useEvent } from 'lib/event';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'ReportEventsMaintenanceEditor'>,
  NativeStackScreenProps<ReportFiltersNavigatorParamList>
>;

const ReportEventsMaintenanceEditorScreen = ({ navigation, route }: Props) => {
  const { reportId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  // const event = useEvent();

  const realm = useRealm();

  const report = useObject(EventsMaintenanceReport, new BSON.ObjectId(reportId));

  const [name, setName] = useState<string | undefined>(report?.name);
  const [ordinal, _setOrdinal] = useState<number>(report?.ordinal || 999);
  const [includesSummary, setIncludesSummary] = useState(report ? report.includesSummary : true);
  const [includesEvents, setIncludesEvents] = useState(report ? report.includesEvents : true);
  const [includesMaintenance, setIncludesMaintenance] = useState(report ? report.includesMaintenance : true);
  const [eventsFilter, _setEventsFilter] = useState(report?.eventsFilter);
  const [maintenanceFilter, _setMaintenaceFilter] = useState(report?.maintenenaceFilter);

  // useEffect(() => {
  //   event.on('events-report-filter', setEventsFilterId);
  //   event.on('maintenance-report-filter', setMaintenaceFilterId);
  //   return () => {
  //     event.removeListener('events-report-filter', setEventsFilterId);
  //     event.removeListener('maintenance-report-filter', setMaintenaceFilterId);
  //   };
  // }, []);

  // useState(() => {
  //   // Fetch filter from realm to update view
  // }), [ eventsFilter ];

  // useState(() => {
  //   // Fetch filter from realm to update view
  // }), [ maintenanceFilter ];

  useEffect(() => {
    const canSave = name && (
      !eqString(report?.name, name)
    );

    const save = () => {
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
  }, [ name ]);

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
        position={['first']}
        onValueChange={setIncludesEvents}
      />
      <ListItem
        title={'No Filter Selected'}
        subtitle={'Report will include all events'}
        position={['last']}
        onPress={() => navigation.navigate('ReportFiltersNavigator', {
          screen: 'ReportFilters',
          params: { 
            filterType: FilterType.ReportEventsFilter,
            eventName: 'events-report-filter',
          },
        })}
      />
      <Divider />
      <ListItemSwitch
        title={'Includes Maintenance'}
        value={includesMaintenance}
        position={['first']}
        onValueChange={setIncludesMaintenance}
      />
      <ListItem
        title={'No Filter Selected'}
        subtitle={'Report will include all maintenace items'}
        position={['last']}
        onPress={() => navigation.navigate('ReportFiltersNavigator', {
          screen: 'ReportFilters',
          params: { 
            filterType: FilterType.ReportMaintenanceFilter,
            eventName: 'maintenance-report-filter',
          },
        })}
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
