import { ListItem, ListItemDate, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import { ModelViewMethods, ModelViewProps } from './types';
import React, { useState } from 'react';

import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { NewModelNavigatorParamList } from 'types/navigation';
import { ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/core';

type ModelView = ModelViewMethods;

type NavigationProps = StackNavigationProp<NewModelNavigatorParamList, 'NewModel'>;

const ModelView = (props: ModelViewProps) => {
  const { modelId } = props;

  const navigation = useNavigation<NavigationProps>();

  const [batteryLoggingEnabled, setBatteryLoggingEnabled] = useState(false);
  const [fuelLoggingEnabled, setFuelLoggingEnabled] = useState(false);
  const [modelIsDamaged, setModelIsDamaged] = useState(false);
  const [modelIsRetired, setModelIsRetired] = useState(false);
  const [expandedLastFlight, setExpandedLastFlight] = useState(false);
  const [lastFlightDate, setLastFlightDate] = useState<string>();

  const toggleBatteryLogging = (value: boolean) => {
    setBatteryLoggingEnabled(value);
  };

  const toggleFuelLogging = (value: boolean) => {
    setFuelLoggingEnabled(value);
  };

  const toggleModelIsDamaged = (value: boolean) => {
    setModelIsDamaged(value);
  };

  const toggleModelIsRetired = (value: boolean) => {
    setModelIsRetired(value);
  };

  const onLastFlightDateChange = (date?: Date) => {
    date && setLastFlightDate(DateTime.fromJSDate(date).toISO() || new Date().toISOString());
  };

  return (
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
          onPress={() => navigation.navigate('ModelType')}
        />
      }
      <ListItem
        title={'Category'}
        value={'None'}
        position={modelId ? ['first', 'last'] : ['last']}
        onPress={() => navigation.navigate('ModelCategory')}
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
          onDateChange={onLastFlightDateChange} />
      {modelId &&
        <ListItem
          title={'Logged Flight Details'}
          value={'0'}
          position={['last']}
          onPress={() => null}
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
        onPress={() => navigation.navigate('EventStyle')}
      />
      <ListItem
        title={'Default Propeller'}
        value={'None'}
        position={['last']}
        onPress={() => navigation.navigate('Propeller')}
      />
      <Divider />
      <ListItem
        title={'QR Code Size'}
        value={'None'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('ScanCodeSize')}
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
          value={modelIsRetired}
          onValueChange={toggleModelIsRetired}
        />
      }
      <ListItemSwitch
        title={'Airplane is Damaged'}
        position={['last']}
        value={modelIsDamaged}
        onValueChange={toggleModelIsDamaged}
      />
      <Divider />
      <ListItem
        title={'Notes'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('Notes')}
      />
      <Divider />
    </ScrollView>
  );
};

export default ModelView;
