import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemDate, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import { ModelsNavigatorParamList, NewModelNavigatorParamList } from 'types/navigation';
import React, { useEffect, useState } from 'react';
import { modelCategories, modelPropellers, modelStyles } from '../mocks/enums';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { CompositeScreenProps } from '@react-navigation/core';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { Model } from 'realmdb/Model';
import { ModelType } from 'types/model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScanCodeSize } from 'types/common';
import { ScrollView } from 'react-native';
import { enumIdsToValues } from 'lib/utils';
import { makeStyles } from '@rneui/themed';
import { modelTypeIcons } from 'lib/model';
import { useEvent } from 'lib/event';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<ModelsNavigatorParamList, 'ModelEditor'>,
  NativeStackScreenProps<NewModelNavigatorParamList, 'NewModel'>
>;

const ModelEditorScreen = ({ navigation, route }: Props) => {
  const { modelId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const realm = useRealm();
  const model = useObject(Model, new BSON.ObjectId(modelId));

  const [batteryLoggingEnabled, setBatteryLoggingEnabled] = useState(false);
  const [fuelLoggingEnabled, setFuelLoggingEnabled] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);
  const [isRetired, setIsRetired] = useState(false);
  const [expandedLastFlight, setExpandedLastFlight] = useState(false);
  const [lastFlightDate, setLastFlightDate] = useState<string>();
  const [notes, setNotes] = useState('');

  useEffect(() => {
    navigation.setOptions({
      title: model ? model.type : 'New Model',
      headerLeft: () => (
        <Button
          title={'Cancel'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
          onPress={navigation.goBack}
        />
      ),
      headerRight: () => (
        <Button
          title={'Save'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.saveButton]}
          onPress={() => null}
        />
      ),
    });
  }, []);

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: ()  => {
  //       return (
  //         <>
  //           <Icon
  //             name={'chevron-up'}
  //             style={s.headerIcon}
  //             onPress={() => null}/>
  //           <Icon
  //             name={'chevron-down'}
  //             style={s.headerIcon}
  //             onPress={() => null}/>
  //         </>
  //       );
  //     },
  //   });
  // }, []);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('category', onChangeCategory);
    event.on('default-propeller', onChangeDefaultPropeller);
    event.on('default-style', onChangeDefaultStyle);

    return () => {
      event.removeListener('category', onChangeCategory);
      event.removeListener('default-propeller', onChangeDefaultPropeller);
      event.removeListener('default-style', onChangeDefaultStyle);  
    };
  }, []);

  const onChangeCategory = (v: string) => {};
  const onChangeDefaultPropeller = (v: string) => {};
  const onChangeDefaultStyle = (v: string) => {};
  
  const toggleBatteryLogging = (value: boolean) => {
    setBatteryLoggingEnabled(value);
  };

  const toggleFuelLogging = (value: boolean) => {
    setFuelLoggingEnabled(value);
  };

  const toggleIsDamaged = (value: boolean) => {
    setIsDamaged(value);
  };

  const toggleIsRetired = (value: boolean) => {
    setIsRetired(value);
  };

  const onLastFlightDateChange = (date?: Date) => {
    date && setLastFlightDate(DateTime.fromJSDate(date).toISO() || new Date().toISOString());
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItem
        title={'Blade 150S'}
        subtitle={'Blade'}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => null}
      />
      <Divider />
      {!modelId &&
      <ListItem
        title={'Model Type'}
        value={'Airplane'}
        position={['first']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Model Type',
          values: Object.values(ModelType),
          selected: 'Helicopter',
          icons: modelTypeIcons,
          eventName: 'category',
        })}
      />
      }
      <ListItem
        title={'Category'}
        value={'None'}
        position={modelId ? ['first', 'last'] : ['last']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Model Category',
          footer: 'You can manage categories through the Globals section in the Setup tab.',
          values: Object.values(modelCategories),
          selected: enumIdsToValues(['id1'], modelCategories),
          eventName: 'category',
        })}
      />
      <Divider />
      {!modelId &&
        <>
          <ListItemInput
            title={'Total Time'}
            value={'10'}
            label='h:mm:ss'
            keyboardType={'number-pad'}
            position={['first']}
          />
          <ListItemInput
            title={'Total Flights'}
            value={'No'}
            label='Flights'
            keyboardType={'number-pad'}
          />
        </>
      }
      {modelId &&
        <ListItem
            title={'Statistics'}
            value={'4:00 in a flight'}
            position={['first']}
            onPress={() => null}
          />
      }
      <ListItemDate
        title={'Last Flight'}
        value={lastFlightDate
          ? DateTime.fromISO(lastFlightDate).toFormat(
            "MMM d, yyyy 'at' hh:mm a"
          )
          : 'Tap to Set...'}
        pickerValue={lastFlightDate}
        rightImage={false}
        expanded={expandedLastFlight}
        position={modelId ? [] : ['last']}
        onPress={() => setExpandedLastFlight(!expandedLastFlight)}
        onDateChange={onLastFlightDateChange}
      />
      {modelId &&
        <ListItem
          title={'Logged Flight Details'}
          value={'0'}
          position={['last']}
          onPress={() => navigation.navigate('Flights', {
            pilotId: '1'
          })}
        />
      }
      <Divider />
      <ListItemSwitch
        title={'Battery Logging'}
        value={batteryLoggingEnabled}
        position={['first']}
        onValueChange={toggleBatteryLogging}
      />
      {batteryLoggingEnabled &&
        <ListItem
          title={'Favorite Batteries'}
          value={'1'}
          onPress={() => null}
        />
      }
      <ListItemSwitch
        title={'Fuel Logging'}
        position={fuelLoggingEnabled ? [] : ['last']}
        value={fuelLoggingEnabled}
        onValueChange={toggleFuelLogging}
      />
      {fuelLoggingEnabled &&
        <>
          <ListItemInput
            title={'Fuel Capacity'}
            value={'Value'}
            label='oz'
            keyboardType={'number-pad'}
          />
          <ListItemInput
            title={'Total Fuel Consumed'}
            value={'0.00'}
            label='gal'
            inputDisabled={true}
            position={['last']}
          />
        </>
      }
      {modelId &&
        <>
          <Divider />
          <ListItem
            title={'Checklists'}
            value={'1'}
            position={['first']}
            onPress={() => null}
          />
          <ListItem
            title={'Perform Maintenance'}
            value={'0'}
            onPress={() => null}
          />
          <ListItem
            title={'Maintenance Log'}
            value={'0'}
            position={['last']}
            onPress={() => null}
          />
        </>
      }
      <Divider />
      <ListItem
        title={'Default Style'}
        value={'None'}
        position={['first']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Default Style',
          footer: 'You can manage styles through the Globals section in the Setup tab.',
          values: Object.values(modelStyles),
          selected: enumIdsToValues(['id1'], modelStyles),
          eventName: 'default-style',
        })}
      />
      <ListItem
        title={'Default Propeller'}
        value={'None'}
        position={['last']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Default Propeller',
          footer: 'You can manage propellers through the Globals section in the Setup tab.',
          values: Object.values(modelPropellers),
          selected: enumIdsToValues(['id0'], modelPropellers),
          eventName: 'default-propeller',
        })}
      />
      <Divider />
      <ListItem
        title={'QR Code Size'}
        value={'None'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'QR Code Size',
          values: Object.values(ScanCodeSize),
          selected: 'None',
          eventName: '',
        })}
      />
      <Divider />
      <ListItemInput
        title={'Purchase Price'}
        value={'Unknown'}
        position={['first']}
      />
      {modelId &&
        <ListItemSwitch
          title={'Airplane is Retired'}
          value={isRetired}
          onValueChange={toggleIsRetired}
        />
      }
      <ListItemSwitch
        title={'Airplane is Damaged'}
        position={['last']}
        value={isDamaged}
        onValueChange={toggleIsDamaged}
      />
      <Divider />
      <ListItem
        title={'Notes'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('Notes', {
          title: 'String Value Notes',
          text: notes,
          eventName: 'model-notes',
        })}
      />
      <Divider />
    </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  saveButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default ModelEditorScreen;
