import { AppTheme, useTheme } from 'theme';
import { BatteriesNavigatorParamList, NewBatteryNavigatorParamList } from 'types/navigation';
import { BatteryChemistry, BatteryTint } from 'types/battery';
import { ListItem, ListItemInput, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { batteryCellConfigurationToString, getBatteryCellConfigurationItems } from 'lib/battery';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { Button } from '@rneui/base';
import { CompositeScreenProps } from '@react-navigation/core';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScanCodeSize } from 'types/common';
import { ScrollView } from 'react-native';
import { View } from 'react-native';
import WheelPicker from 'components/atoms/WheelPicker';
import { batteryTintIcons } from 'lib/battery';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<BatteriesNavigatorParamList, 'BatteryEditor'>,
  NativeStackScreenProps<NewBatteryNavigatorParamList, 'NewBattery'>
>;

const BatteryEditorScreen = ({ navigation, route }: Props) => {  
  const { batteryId } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();

  const realm = useRealm();
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));

  const [chemistry, setChemistry] = useState<BatteryChemistry>(BatteryChemistry.LiPo);
  const [isRetired, setIsRetired] = useState(false);
  const [cellConfiguration, setCellConfiguration] = useState<string[]>([]);
  const [expandedCellConfiguration, setExpandedCellConfiguration] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    navigation.setOptions({
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
    event.on('chemistry', onChangeChemistry);
    event.on('battery-tint', onChangeBatteryTint);
    event.on('scan-code-size', onChangeScanCodeSize);

    return () => {
      event.removeListener('chemistry', onChangeChemistry);
      event.removeListener('battery-tint', onChangeBatteryTint);
      event.removeListener('scan-code-size', onChangeScanCodeSize);
    };
  }, []);

  const onChangeChemistry = (v: string) => {};
  const onChangeBatteryTint = (v: string) => {};
  const onChangeScanCodeSize = (v: string) => {};

  const toggleIsRetired = (value: boolean) => {
    setIsRetired(value);
  };

  return (
    <View style={[theme.styles.view]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItem
        title={'150S #1'}
        subtitle={'Pulse'}
        position={['first', 'last']}
        rightImage={false}
        onPress={() => null}
      />
      <Divider />
      <ListItemInput
        title={'Capacity'}
        value={'450'}
        label='mah'
        keyboardType={'number-pad'}
        position={['first']}
      />
      <ListItem
        title={'Chemistry'}
        value={chemistry}
        disabled={batteryId !== undefined}
        rightImage={batteryId === undefined}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Chemistry',
          values: Object.values(BatteryChemistry),
          selected: 'LiPo',
          eventName: 'chemistry',
        })}
      />
      <ListItem
        title={'Cell Configuration'}
        value={batteryCellConfigurationToString(chemistry, cellConfiguration)}
        rightImage={false}
        expanded={expandedCellConfiguration}
        onPress={() => setExpandedCellConfiguration(!expandedCellConfiguration)}
        ExpandableComponent={
          <WheelPicker
            placeholder={'none'}
            itemWidth={['50%', '50%']}
            items={getBatteryCellConfigurationItems(chemistry)}
            value={cellConfiguration}
            onValueChange={(_wheelIndex, value, _index) => {
              setCellConfiguration(value as string[]);
              // setBattery({ cellConfiguration: toArrayOrdinals(value as string[]) });
              // THIS VV
              // setBattery({
              //   sCells: toArrayOrdinals(value as string[])[0],
              //   pCells: toArrayOrdinals(value as string[])[1]
              // });
            }}
          />
        }
        />
      <ListItemInput
        title={'Discharge Rate'}
        value={'Unknown'}
        label={'C'}
        keyboardType={'number-pad'}
        position={['last']}
      />
      <Divider />
      {batteryId &&
        <>
          <ListItem
            title={'Statistics'}
            value={'No cycles'}
            position={['first']}
            rightImage={false}
          />
          <ListItem
            title={'Battery Performance'}
            onPress={() => navigation.navigate('BatteryPerformance')}
          />
          <ListItem
            title={'Logged Cycle Details'}
            value={'0'}
            position={['last']}
            onPress={() => navigation.navigate('BatteryCycles')}
          />
        </>
      }
      {!batteryId &&
        <ListItemInput
          title={'Total Cycles'}
          value={'None'}
          keyboardType={'number-pad'}
          position={['first', 'last']}
        />
      }
      <Divider />
      <ListItem
        title={'Battery Tint'}
        value={'None'}
        position={['first']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'Battery Tint',
          values: Object.values(BatteryTint),
          selected: 'None',
          icons: batteryTintIcons,
          eventName: 'battery-tint',
        })}
      />
      <ListItem
        title={'QR Code Size'}
        value={'None'}
        position={['last']}
        onPress={() => navigation.navigate('EnumPicker', {
          title: 'QR Code Size',
          values: Object.values(ScanCodeSize),
          selected: 'None',
          eventName: 'scan-code-size',
        })}
      />
      <Divider />
      <ListItemInput
        title={'Purchase Price'}
        value={'Unknown'}
        keyboardType={'number-pad'}
        position={batteryId ? ['first'] : ['first', 'last']}
      />
      {batteryId &&
      <>
        <ListItemInput
          title={'Operating Cost'}
          value={'Unknown'}
          label={'per cycle'}
          keyboardType={'number-pad'}
          />
        <ListItemSwitch
          title={'Battery is Retired'}
          position={['last']}
          value={isRetired}
          onValueChange={toggleIsRetired}
        />
      </>
      }
      <Divider />
      <ListItem
        title={'Notes'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('Notes', {
          title: 'String Value Notes',
          text: notes,
          eventName: 'battery-notes',
        })}
      />
      <Divider />
      </ScrollView>
    </View>
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

export default BatteryEditorScreen;
