import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ModelFuel } from 'realmdb/ModelFuel';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useConfirmAction } from 'lib/useConfirmAction';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ModelFuels'>;

const ModelFuelsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const allModelFuels = useQuery(ModelFuel);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<Icon name={'plus'} style={s.headerIcon}/>}
            onPress={() => navigation.navigate('NewModelFuelNavigator', {
              screen: 'NewModelFuel',
            })}
          />
        )
      },
    });
  }, []);

  const deleteFuel = (fuel: ModelFuel) => {
    realm.write(() => {
      realm.delete(fuel);
    });
  };

  const renderModelFuel: ListRenderItem<ModelFuel> = ({ item: fuel, index }) => {
    return (
      <ListItem
      ref={ref => ref && listEditor.add(ref, 'model-fuels', fuel._id.toString())}
      key={fuel._id.toString()}
      title={fuel.name}
      position={listItemPosition(index, allModelFuels.length)}
        onPress={() => navigation.navigate('ModelFuelEditor', {
          modelFuelId: fuel._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            ...swipeableDeleteItem[theme.mode],
            onPress: () => confirmAction(deleteFuel, {
              label: 'Delete Saved Filter',
              title: 'This action cannot be undone.\nAre you sure you want to delete this fuel?',
              value: fuel,
            })
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('model-fuels', fuel._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  if (!allModelFuels.length) {
    return (
      <EmptyView info message={'No Model Fuels'} details={"Tap the + button to add your first model fuel."} />
    );    
  }

  return (
    <FlatList
      style={theme.styles.view}
      data={allModelFuels}
      renderItem={renderModelFuel}
      keyExtractor={item => item._id.toString()}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={allModelFuels.length ? <Divider /> : null}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerIcon: {
    color: theme.colors.clearButtonText,
    fontSize: 22,
  },
}));

export default ModelFuelsScreen;
