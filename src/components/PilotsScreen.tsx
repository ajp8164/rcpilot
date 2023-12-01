import { AppTheme, useTheme } from 'theme';
import React, { useEffect, useState } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItemCheckboxInfo } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'types/pilot';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Pilots'>;

const PilotsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [items, setItems] = useState<Pilot[]>([
    {
      id: '1',
      name: 'Andy',
    },
    {
      id: '2',
      name: 'Lisa',
    },
  ]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            type={'clear'}
            icon={ <Icon name={'plus'} style={s.addIcon} /> }
            onPress={() => navigation.navigate('NewPilot')}
          />
        )
      },
    });
  }, []);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      {items.map((item, index) => {
        return (
          <ListItemCheckboxInfo
            key={item.id}
            title={item.name}
            position={items.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === items.length - 1 ? ['last'] : []}
            checked={true}
            onPress={() => null}
            onPressInfo={() => navigation.navigate('Pilot')}
          />
        )
      })}
      <Divider />
      <ListItemCheckboxInfo
        title={'Unknown Pilot'}
        subtitle={'Logged 0:04 over 1 event'}
        position={['first', 'last']}
        hideInfo={true}
        checked={true}
        onPress={() => null}
      />
      <Divider type={'note'} text={'Includes events logged with an "Unknown" pilot and model time not directly associated with an event.'}  />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  addIcon: {
    color: theme.colors.brandPrimary,
    fontSize: 22,
    marginHorizontal: 10,
  },
}));

export default PilotsScreen;
