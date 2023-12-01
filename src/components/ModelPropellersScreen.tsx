import { AppTheme, useTheme } from 'theme';
import { ModelPropeller, ModelPropellerUnits } from 'types/model';
import React, { useEffect, useState } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ModelPropellers'>;

const ModelPropellersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [items, setItems] = useState<ModelPropeller[]>([
    {
      id: '1',
      name: 'One',
      vendor: '',
      diameter: 0,
      pitch: 0,
      measuredUnits: ModelPropellerUnits.Inches,
      notes: '',
    },
  ]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            type={'clear'}
            icon={ <Icon name={'plus'} style={s.addIcon} /> }
            onPress={() => navigation.navigate('NewModelPropellerNavigator')}
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
            onPress={() => navigation.navigate('ModelPropellerEditor', {
              modelPropellerId: '1',
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

export default ModelPropellersScreen;
