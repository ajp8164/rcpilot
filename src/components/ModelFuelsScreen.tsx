import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { ActionSheet } from 'react-native-ui-lib';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { ModelFuel } from 'realmdb/ModelFuel';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ModelFuels'>;

const ModelFuelsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();

  const allModelFuels = useQuery(ModelFuel);
  const [deleteFuelActionSheetVisible, setDeleteFuelActionSheetVisible] = useState<ModelFuel>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            type={'clear'}
            icon={ <Icon name={'plus'} style={s.addIcon} /> }
            onPress={() => navigation.navigate('NewModelFuelNavigator')}
          />
        )
      },
    });
  }, []);

  const confirmDeleteFuel = (fuel: ModelFuel) => {
    setDeleteFuelActionSheetVisible(fuel);
  };

  const deleteFuel = (fuel: ModelFuel) => {
    realm.write(() => {
      realm.delete(fuel);
    });
  };

  const renderItems: ListRenderItem<ModelFuel> = ({ item: fuel, index }) => {
    return (
      <ListItem
      key={fuel._id.toString()}
      title={fuel.name}
        position={allModelFuels.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allModelFuels.length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ModelFuelEditor', {
          modelFuelId: fuel._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            icon: 'delete',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => confirmDeleteFuel(fuel),
          }]
        }}
      />
    )
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <FlatList
        data={allModelFuels}
        renderItem={renderItems}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={Divider}
      />
      <ActionSheet
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        options={[
          {
            label: 'Delete Fuel',
            onPress: () => {
              deleteFuel(deleteFuelActionSheetVisible!);
              setDeleteFuelActionSheetVisible(undefined);
            },
          },
          {
            label: 'Cancel' ,
            onPress: () => setDeleteFuelActionSheetVisible(undefined),
          },
        ]}
        useNativeIOS={true}
        visible={!!deleteFuelActionSheetVisible}
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  addIcon: {
    color: theme.colors.brandPrimary,
    fontSize: 22,
  },
}));

export default ModelFuelsScreen;
