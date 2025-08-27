import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';

import {
  Divider,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItem,
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
import { Filter } from 'realmdb/Filter';
import { ScanCodesReport } from 'realmdb/ScanCodesReport';
import { selectFilters } from 'store/selectors/filterSelectors';
import { FilterType } from 'types/filter';
import { SetupNavigatorParamList } from 'types/navigation';
import * as Yup from 'yup';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'ReportScanCodesEditor'
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

const ReportScanCodesEditorScreen = ({ navigation, route }: Props) => {
  const { reportId } = route.params;

  const theme = useTheme();
  const realm = useRealm();

  const report = useObject(ScanCodesReport, new BSON.ObjectId(reportId));
  const reportModeslFilterId = useSelector(
    selectFilters(FilterType.ReportModelScanCodesFilter),
  );
  const reportBatteriesFilterId = useSelector(
    selectFilters(FilterType.ReportBatteryScanCodesFilter),
  );

  const [includesModels, setIncludesModels] = useState(
    report ? report.includesModels : true,
  );
  const [includesBatteries, setIncludesBatteries] = useState(
    report ? report.includesBatteries : true,
  );
  const [modelScanCodesFilter, setModelScanCodesFilter] = useState(
    report?.modelScanCodesFilter,
  );
  const [batteryScanCodesFilter, setBatteryScanCodesFilter] = useState(
    report?.batteryScanCodesFilter,
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
      new BSON.ObjectId(reportModeslFilterId),
    ) as Filter;
    setModelScanCodesFilter(filter);

    // Update the exiting report immediately.
    if (report) {
      realm.write(() => {
        report.modelScanCodesFilter = filter;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportModeslFilterId]);

  useEffect(() => {
    const filter = realm.objectForPrimaryKey(
      'Filter',
      new BSON.ObjectId(reportBatteriesFilterId),
    ) as Filter;
    setBatteryScanCodesFilter(filter);

    // Update the exiting report immediately.
    if (report) {
      realm.write(() => {
        report.batteryScanCodesFilter = filter;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportBatteriesFilterId]);

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
          report.includesModels = includesModels;
          report.includesBatteries = includesBatteries;
          report.modelScanCodesFilter = modelScanCodesFilter;
          report.batteryScanCodesFilter = batteryScanCodesFilter;
        });
      }
    } else {
      // Insert new report.
      realm.write(() => {
        realm.create('ScanCodesReport', {
          name: values.name,
          ordinal: values.ordinal,
          includesModels,
          includesBatteries,
          modelScanCodesFilter,
          batteryScanCodesFilter,
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
                position={['first', 'last']}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('name'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.name),
                  value: values.name,
                  label: 'Report Name',
                  placeholder: 'Report Name',
                  autoCapitalize: 'words',
                }}
              />
              <Divider text={'CONTENTS'} />
              <ListItemSwitchCollapsible
                title={'Includes Models'}
                value={includesModels}
                position={includesModels ? ['first'] : ['first', 'last']}
                onValueChange={setIncludesModels}
                expanded={includesModels}>
                <ListItem
                  title={modelScanCodesFilter?.name || 'No Filter Selected'}
                  subtitle={
                    modelScanCodesFilter
                      ? filterSummary(modelScanCodesFilter)
                      : 'Report will include all models'
                  }
                  subtitleLines={2}
                  rightContent={'chevron-right'}
                  position={['last']}
                  onPress={() =>
                    navigation.navigate('ReportModelScanCodeFiltersNavigator', {
                      screen: 'ReportModelScanCodeFilters',
                      params: {
                        filterType: FilterType.ReportModelScanCodesFilter,
                      },
                    })
                  }
                />
              </ListItemSwitchCollapsible>
              <Divider />
              <ListItemSwitchCollapsible
                title={'Includes Batteries'}
                value={includesBatteries}
                position={includesBatteries ? ['first'] : ['first', 'last']}
                onValueChange={setIncludesBatteries}
                expanded={includesBatteries}>
                <ListItem
                  title={batteryScanCodesFilter?.name || 'No Filter Selected'}
                  subtitle={
                    batteryScanCodesFilter
                      ? filterSummary(batteryScanCodesFilter)
                      : 'Report will include all batteries'
                  }
                  subtitleLines={2}
                  rightContent={'chevron-right'}
                  position={['last']}
                  onPress={() =>
                    navigation.navigate(
                      'ReportBatteryScanCodeFiltersNavigator',
                      {
                        screen: 'ReportBatteryScanCodeFilters',
                        params: {
                          filterType: FilterType.ReportBatteryScanCodesFilter,
                        },
                      },
                    )
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
        doneText={'Done'}
        disabledDone={!formikCanSubmit}
        onDone={Keyboard.dismiss}
      />
    </>
  );
};

export default ReportScanCodesEditorScreen;
