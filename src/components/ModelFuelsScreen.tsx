import { ActionSheetConfirm, ActionSheetConfirmMethods } from 'components/molecules/ActionSheetConfirm';
import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useRef } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ModelFuel } from 'realmdb/ModelFuel';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ModelFuels'>;

const ModelFuelsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const realm = useRealm();

  const allModelFuels = useQuery(ModelFuel);
  const actionSheetConfirm = useRef<ActionSheetConfirmMethods>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
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
      ref={ref => listEditor.add(ref, 'model-fuels', index)}
      key={fuel._id.toString()}
      title={fuel.name}
      position={listItemPosition(index, allModelFuels.length)}
        onPress={() => navigation.navigate('ModelFuelEditor', {
          modelFuelId: fuel._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            icon: 'trash',
            iconType: 'font-awesome',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => actionSheetConfirm.current?.confirm(fuel),
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('model-fuels', index)}
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
    <>
      <FlatList
        data={allModelFuels}
        renderItem={renderModelFuel}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allModelFuels.length ? <Divider /> : null}
      />
      <ActionSheetConfirm ref={actionSheetConfirm} label={'Delete Fuel'} onConfirm={deleteFuel} />
    </>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
  },
}));

export default ModelFuelsScreen;
