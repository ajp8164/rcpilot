import { AppTheme, useTheme } from 'theme';
import React, { useEffect, useState } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { EventStyle } from 'types/event';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'EventStyles'>;

const EventStylesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [items, setItems] = useState<EventStyle[]>([
    {
      id: '1',
      name: '3D',
    },
  ]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            type={'clear'}
            icon={ <Icon name={'plus'} style={s.addIcon} /> }
            onPress={() => navigation.navigate('NewEventStyle')}
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
          <ListItem
            key={item.id}
            title={item.name}
            position={items.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === items.length - 1 ? ['last'] : []}
            onPress={() => navigation.navigate('EventStyleEditor', {
              eventStyleId: '1',
            })}
          />
        )
      })}
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

export default EventStylesScreen;
