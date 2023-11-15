import { AppTheme, useTheme } from 'theme';
import { Divider, ListItem, ListItemSwitch } from '@react-native-ajp-elements/ui';
import { ModelViewMethods, ModelViewProps } from './types';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { NewModelNavigatorParamList } from 'types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { makeStyles } from '@rneui/themed';
import { useNavigation } from '@react-navigation/core';

type ModelView = ModelViewMethods;

type NavigationProps = StackNavigationProp<NewModelNavigatorParamList, 'NewModel'>;

const ModelView = (props: ModelViewProps) => {
  const { modelId } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const navigation = useNavigation<NavigationProps>();

  const [batteryLoggingEnabled, setBatteryLoggingEnabled] = useState(false);
  const [fuelLoggingEnabled, setFuelLoggingEnabled] = useState(false);
  const [modelIsDamaged, setModelIsDamaged] = useState(false);
  const [modelIsRetired, setModelIsRetired] = useState(false);

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

  return (
    <View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItem
        title={'Blade 150S'}
        subtitle={'Blade'}
        position={['first', 'last']}
        onPress={() => null}
      />
      <Divider />
      {!modelId &&
        <ListItem
          title={'Model Type'}
          position={['first']}
          onPress={() => navigation.navigate('ModelType')}
        />
      }
      <ListItem
        title={'Category'}
        position={modelId ? ['first', 'last'] : ['last']}
        onPress={() => navigation.navigate('ModelCategory')}
        />
      <Divider />
      {!modelId &&
        <>
          <ListItem
            title={'Total Time'}
            position={['first']}
            onPress={() => null}
          />
          <ListItem
            title={'Total Flights'}
            onPress={() => null}
          />
        </>
      }
      {modelId &&
        <ListItem
            title={'Statistics'}
            position={['first']}
            onPress={() => null}
          />
      }
      <ListItem
        title={'Last Flight'}
        position={modelId ? [] : ['last']}
        onPress={() => null}
      />
      {modelId &&
        <ListItem
            title={'Logged Flight Details'}
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
          onPress={() => null} />
      }
      <ListItemSwitch
        title={'Fuel Logging'}
        position={fuelLoggingEnabled ? [] : ['last']}
        value={fuelLoggingEnabled}
        onValueChange={toggleFuelLogging}
      />
      {fuelLoggingEnabled &&
        <>
          <ListItem
            title={'Fuel Capacity'}
            onPress={() => null}
          />
          <ListItem
            title={'Total Fuel Consumed'}
            position={['last']}
            onPress={() => null}
          />
        </>
      }
      {modelId &&
        <>
          <Divider />
          <ListItem
            title={'Checklists'}
            position={['first']}
            onPress={() => null}
          />
          <ListItem
            title={'Perform Maintenance'}
            onPress={() => null}
          />
          <ListItem
            title={'Maintenance Log'}
            position={['last']}
            onPress={() => null}
          />
        </>
      }
      <Divider />
      <ListItem
        title={'Default Style'}
        position={['first']}
        onPress={() => navigation.navigate('EventStyle')}
      />
      <ListItem
        title={'Default Propeller'}
        position={['last']}
        onPress={() => null}
      />
      <Divider />
      <ListItem
        title={'Barcode Size'}
        position={['first', 'last']}
        onPress={() => null}
      />
      <Divider />
      <ListItem
        title={'Purchase Price'}
        position={['first']}
        onPress={() => null}
      />
      {modelId &&
        <ListItemSwitch
          title={'Model is Retired'}
          value={modelIsRetired}
          onValueChange={toggleModelIsRetired}
        />
      }
      <ListItemSwitch
        title={'Model is Damaged'}
        position={['last']}
        value={modelIsDamaged}
        onValueChange={toggleModelIsDamaged}
      />
      <Divider />
      <ListItem
        title={'Notes'}
        position={['first', 'last']}
        onPress={() => null}
      />
      <Divider />
      </ScrollView>
    </View>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  view: {
  },
}));

export default ModelView;
