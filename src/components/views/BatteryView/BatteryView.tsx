import { AppTheme, useTheme } from 'theme';
import { BatteryViewMethods, BatteryViewProps } from './types';
import { Divider, ListItem, ListItemSwitch } from '@react-native-ajp-elements/ui';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { makeStyles } from '@rneui/themed';

type BatteryView = BatteryViewMethods;

const BatteryView = (props: BatteryViewProps) => {
  const { batteryId } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const [batteryIsRetired, setBatteryIsRetired] = useState(false);

  const toggleBatteryIsRetired = (value: boolean) => {
    setBatteryIsRetired(value);
  };

  return (
    <View style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItem
        title={'150S #1'}
        subtitle={'Pulse'}
        position={['first', 'last']}
        onPress={() => null}
      />
      <Divider />
      <ListItem
        title={'Capacity'}
        position={['first']}
        onPress={() => null}
      />
      <ListItem
        title={'Chemistry'}
        onPress={() => null}
      />
      <ListItem
        title={'Cell Configuration'}
        onPress={() => null}
      />
      <ListItem
        title={'Discharge Rate'}
        position={['last']}
        onPress={() => null}
      />
      <Divider />
      {batteryId &&
        <>
          <ListItem
            title={'Statistics'}
            position={['first']}
            onPress={() => null}
          />
          <ListItem
            title={'Battery Performance'}
            onPress={() => null}
          />
          <ListItem
            title={'Logged Cycle Details'}
            position={['last']}
            onPress={() => null}
          />
        </>
      }
      {!batteryId &&
        <ListItem
          title={'Total Cycles'}
          position={['first', 'last']}
          onPress={() => null}
        />
      }
      <Divider />
      <ListItem
        title={'Battery Tint'}
        position={['first']}
        onPress={() => null}
      />
      <ListItem
        title={'Barcode Size'}
        position={['last']}
        onPress={() => null}
      />
      <Divider />
      <ListItem
        title={'Purchase Price'}
        position={batteryId ? ['first'] : ['first', 'last']}
        onPress={() => null}
      />
      {batteryId &&
      <>
        <ListItem
          title={'Operating Cost'}
          onPress={() => null}
        />
        <ListItemSwitch
          title={'Battery is Retired'}
          position={['last']}
          value={batteryIsRetired}
          onValueChange={toggleBatteryIsRetired}
        />
      </>
      }
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

export default BatteryView;
