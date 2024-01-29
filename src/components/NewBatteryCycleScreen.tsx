import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput, ListItemSegmented, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewBatteryCycleNavigatorParamList } from 'types/navigation';
import { ScrollView } from 'react-native';
import { makeStyles } from '@rneui/themed';

enum Action {
  Charge = 0,
  Discharge = 1,
};

export type Props = NativeStackScreenProps<NewBatteryCycleNavigatorParamList, 'NewBatteryCycle'>;

const NewBatteryCycleScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

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
      headerRight: ()  => {
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
  }, []);
  
  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
    <Divider text={'BATTERY'} />
    <ListItem
      title={'150S #1'}
      subtitle={'Pulse'}
      position={['first', 'last']}
      rightImage={false}
    />
    <Divider text={'ACTION'} />
    <ListItemSegmented
      segments={['Charge Action', 'Discharge Action']}
      fullWidth={true}
      disabled={false}
      position={['first', 'last']}
      onChangeIndex={index => setTimeout(() => setAction(index), 200)}
    />
    <Divider />
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

export default NewBatteryCycleScreen;
