import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSegmented, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { BatteryTint } from 'types/battery';
import { Divider } from '@react-native-ajp-elements/ui';
import { ErrorView } from 'components/molecules/ErrorView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewBatteryCycleNavigatorParamList } from 'types/navigation';
import { batteryTintIcons } from 'lib/battery';
import { makeStyles } from '@rneui/themed';
import { useObject } from '@realm/react';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';

enum Action {
  Charge = 0,
  Discharge = 1,
};

export type Props = NativeStackScreenProps<NewBatteryCycleNavigatorParamList, 'NewBatteryCycle'>;

const NewBatteryCycleScreen = ({ navigation, route }: Props) => {
  const { batteryId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);
  const setScreenEditHeader = useScreenEditHeader();

  const battery = useObject(Battery, new BSON.ObjectId(batteryId));

  const [excludeFromPlotsEnabled, setExcludeFromPlotsEnabled] = useState(false);
  const [chargeForStorageEnabled, setChargeForStorageEnabled] = useState(false);
  const [action, setAction] = useState<Action>(Action.Charge);

  useEffect(() => {
    const canSave = false;

    const save = () => {
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({visible: canSave, action: onDone});
  }, []);

  if (!battery) {
    return (<ErrorView message={'Battery not found!'} />);
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
    <Divider text={'BATTERY'} />
    <ListItem
        key={battery._id.toString()}
        title={battery.name}
        subtitle={'1 flight, last Nov 4, 2023\n0:04:00 total time, 4:00 avg time'}
        subtitleNumberOfLines={2}
        containerStyle={{
          ...s.batteryTint,
          borderLeftColor: battery.tint !== BatteryTint.None ? batteryTintIcons[battery.tint]?.color : theme.colors.transparent,
        }}
        titleStyle={s.batteryText}
        subtitleStyle={s.batteryText}
        position={['first', 'last']}
        leftImage={
          <View>
            <Icon
              name={'battery-full'}
              solid={true}
              size={45}
              color={theme.colors.brandPrimary}
              style={s.batteryIcon}
            />
          </View>
        }
     />






    <ListItem
      title={'150S #1'}
      subtitle={'Pulse'}
      position={['first', 'last']}
      rightImage={false}
    />
    <Divider text={'ACTION'} />
    <ListItemSegmented
      segments={['Charge Action', 'Discharge Action']}
      containerStyle={{backgroundColor: theme.colors.transparent}}
      segmentBackgroundColor={theme.colors.hintGray}
      fullWidth={true}
      disabled={false}
      position={['first', 'last']}
      onChangeIndex={index => setTimeout(() => setAction(index), 200)}
    />
    {action === Action.Charge &&
      <>
        <ListItemInput
          title={'Amount'}
          value={undefined}
          placeholder={'Value'}
          label={'mAh'}
          numeric={true}
          numericProps={{prefix: '', delimiter: '', precision: 0, maxValue: 99999}}
          position={['first']}
          onChangeText={() => null}
        />
        <ListItem
          title={'Percent of Capacity'}
          value={'0.0%'}
        />
      </>
    }
    {action === Action.Discharge &&
      <ListItemInput
        title={'Duration'}
        value={undefined}
        placeholder={'Value'}
        label='m:ss'
        numeric={true}
        numericProps={{prefix: '', separator: ':'}}
        keyboardType={'number-pad'}
        position={['first']}
        onChangeText={() => null}
     />
    }
    <ListItemInput
      title={'Pack Voltage'}
      label={'V'}
      value={undefined}
      placeholder={'Value'}
      numeric={true}
      numericProps={{prefix: ''}}
      onChangeText={() => null}
    />
    <ListItemInput
      title={'Pack Resistance'}
      label={'mΩ'}
      value={undefined}
      placeholder={'Value'}
      numeric={true}
      numericProps={{prefix: '', precision: 3}}
      onChangeText={() => null}
    />
    <ListItem
      title={'Cell Voltage'}
      onPress={() => navigation.navigate('BatteryCellVoltages', {
        batteryCycleId: '1',
      })}
    />
    <ListItem
      title={'Cell Resistance'}
      position={['last']}
      onPress={() => navigation.navigate('BatteryCellResistances', {
        batteryCycleId: '1',
      })}
    />
    <Divider />
    <ListItemSwitch
      title={'Charge for Storage'}
      value={chargeForStorageEnabled}
      position={['first']}
      onValueChange={setChargeForStorageEnabled}
    />
    <ListItemSwitch
      title={'Exclude Cycle from Plots'}
      value={excludeFromPlotsEnabled}
      position={['last']}
      onValueChange={setExcludeFromPlotsEnabled}
    />
    <Divider />
    <ListItem
      title={'Notes'}
      position={['first', 'last']}
      onPress={() => navigation.navigate('Notes', {
        title: 'Cycle Notes',
        text: 'notes', // mock
        eventName: 'battery-cycle-notes',
      })}
    />
    <Divider />
  </ScrollView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  batteryIcon: {
    transform: [{rotate: '-90deg'}],
    width: '100%',
    left: -8,
  },
  batteryText: {
    left: 15,
    maxWidth: '90%',
  },
  batteryTint: {
    borderLeftWidth: 8,
  },
}));

export default NewBatteryCycleScreen;
