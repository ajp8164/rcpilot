import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ReportFiltersNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';

import { Button } from '@rneui/base';
import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { FilterType } from 'types/filter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';
import { useRealm } from '@realm/react';

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

  const [name, setName] = useState<string | undefined>(undefined);
  const [includesSummary, setIncludesSummary] = useState(true);
  const [includesEvents, setIncludesEvents] = useState(true);
  const [includesMaintenance, setIncludesMaintenance] = useState(true);
  const [eventsFilterId, setEventsFilterId] = useState();
  const [maintenanceFilterId, setMaintenaceFilterId] = useState();

  useEffect(() => {
    event.on('events-report-filter', setEventsFilterId);
    event.on('maintenance-report-filter', setMaintenaceFilterId);
    return () => {
      event.removeListener('events-report-filter', setEventsFilterId);
      event.removeListener('maintenance-report-filter', setMaintenaceFilterId);
    };
  }, []);

  useState(() => {
    // Fetch filter from realm to update view
  }), [ eventsFilterId ];

  useState(() => {
    // Fetch filter from realm to update view
  }), [ maintenanceFilterId ];

  useEffect(() => {
    const canSave = name !== undefined;

    const save = () => {
      realm.write(() => {
        realm.create('Report', {
          name
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
  }, [name]);

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
