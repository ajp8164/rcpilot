import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';

import {
  Divider,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItem,
  ListItemSwitch,
  ListItemSwitchCollapsible,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemInputMethods } from 'components/atoms/List';
import { Formik, FormikProps } from 'formik';
import { filterSummary } from 'lib/filter';
import { BSON } from 'realm';
import { EventsMaintenanceReport } from 'realmdb/EventsMaintenanceReport';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { FilterType } from 'types/filter';
import { SetupNavigatorParamList } from 'types/navigation';
import * as Yup from 'yup';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'ReportEventsMaintenanceEditor'
>;

// Order of fields for accessory view.
enum Fields {
  name,
  ordinal,
}

type FormValues = {
  name: string;
  ordinal: number;
};

const ReportEventsMaintenanceEditorScreen = ({ navigation, route }: Props) => {
  const { reportId } = route.params;

  const theme = useTheme();
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

  const initialValues = {
    name: report?.name,
    ordinal: report?.ordinal || 999,
  } as FormValues;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    ordinal: Yup.number().required(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);

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

  const cancel = () => {
    Keyboard.dismiss();
    formikRef.current?.resetForm();
    navigation.goBack();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    navigation.goBack();
  };

  const onSubmit = (values: FormValues) => {
    if (reportId) {
      // Update existing report.
      if (report) {
        realm.write(() => {
          report.name = values.name || 'no-name';
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
          name: values.name,
          ordinal: values.ordinal,
          includesSummary,
          includesEvents,
          includesMaintenance,
          eventsFilter,
          maintenanceFilter,
        });
      });
    }
  };

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={cancel}
          />
        );
      },
      headerRight: () => {
        return (
          <Button
            title={'Save'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabledTitleStyle={theme.styles.buttonScreenHeaderTitle}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            disabled={!canSubmit}
            onPress={save}
          />
        );
      },
    });
  };

  return (
    <>
      <ScrollView style={theme.styles.view}>
        <Formik
          innerRef={formik => {
            if (formik) {
              formikRef.current = formik;
            }
          }}
          initialValues={initialValues}
          validationSchema={schema}
          validateOnMount
          onSubmit={onSubmit}>
          {({ handleChange, values }) => (
            <View>
              <FormikStateWatcher<FormValues>
                onChange={onFormikWatcherStateChange}
              />
              <Divider text={'REPORT NAME'} />
              <ListItemInput
                ref={nameFieldRef}
                position={['first', 'last']}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('name'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.name),
                  value: values.name,
                  placeholder: 'Report Name',
                  autoCapitalize: 'words',
                }}
              />
              <Divider text={'CONTENTS'} />
              <ListItemSwitch
                title={'Includes Summary'}
                value={includesSummary}
                position={['first', 'last']}
                onValueChange={setIncludesSummary}
              />
              <Divider />
              <ListItemSwitchCollapsible
                title={'Includes Events'}
                value={includesEvents}
                position={includesEvents ? ['first'] : ['first', 'last']}
                onValueChange={setIncludesEvents}
                expanded={includesEvents}>
                <ListItem
                  title={
                    eventsFilter ? eventsFilter.name : 'No Filter Selected'
                  }
                  subtitle={
                    eventsFilter
                      ? filterSummary(eventsFilter)
                      : 'Report will include all events.'
                  }
                  subtitleLines={0}
                  rightContent={'chevron-right'}
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
              </ListItemSwitchCollapsible>
              <Divider />
              <ListItemSwitchCollapsible
                title={'Includes Maintenance'}
                value={includesMaintenance}
                position={includesMaintenance ? ['first'] : ['first', 'last']}
                onValueChange={setIncludesMaintenance}
                expanded={includesMaintenance}>
                <ListItem
                  title={
                    maintenanceFilter
                      ? maintenanceFilter.name
                      : 'No Filter Selected'
                  }
                  subtitle={
                    maintenanceFilter
                      ? filterSummary(maintenanceFilter)
                      : 'Report will include all maintenance items.'
                  }
                  subtitleLines={0}
                  rightContent={'chevron-right'}
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
              </ListItemSwitchCollapsible>
            </View>
          )}
        </Formik>
      </ScrollView>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={[nameFieldRef.current]}
        doneText={'Save'}
        disabledDone={!formikCanSubmit}
        onDone={save}
      />
    </>
  );
};

export default ReportEventsMaintenanceEditorScreen;
