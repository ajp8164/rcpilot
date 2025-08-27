import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItem } from 'react-native';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItemSwipeable,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Plus, Trash2 } from 'lucide-react-native';
import { BSON } from 'realm';
import { ModelFuel } from 'realmdb/ModelFuel';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'ModelFuels'
>;

const ModelFuelsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const allModelFuels = useQuery(ModelFuel);

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            headerRight
            icon={
              <Plus color={theme.colors.screenHeaderButtonText} size={28} />
            }
            onPress={() =>
              navigation.navigate('NewModelFuelNavigator', {
                screen: 'NewModelFuel',
              })
            }
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteFuel = (modelFuelId: string) => {
    const event = realm.objectForPrimaryKey(
      ModelFuel,
      new BSON.ObjectId(modelFuelId),
    );
    if (event?.isValid()) {
      realm.write(() => {
        realm.delete(event);
      });
    }
  };

  const renderModelFuel: ListRenderItem<ModelFuel> = ({
    item: fuel,
    index,
  }) => {
    return (
      <ListItemSwipeable
        key={fuel._id.toString()}
        title={fuel.name}
        position={listItemPosition(index, allModelFuels.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() =>
          navigation.navigate('ModelFuelEditor', {
            modelFuelId: fuel._id.toString(),
          })
        }
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
          draggable: true,
        }}
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              return confirmAction({
                label: `Delete Fuel`,
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this fuel?',
              });
            },
            onPress: () => deleteFuel(fuel._id.toString()),
          },
        ]}
      />
    );
  };

  if (!allModelFuels.length) {
    return (
      <EmptyView
        info
        message={'No Model Fuels'}
        details={'Tap the + button to add Model Fuel.'}
        buttonTitle={'Add Model Fuel'}
        onButtonPress={() =>
          navigation.navigate('NewModelFuelNavigator', {
            screen: 'NewModelFuel',
          })
        }
      />
    );
  }

  return (
    <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
      <FlatList
        style={theme.styles.view}
        data={allModelFuels}
        renderItem={renderModelFuel}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allModelFuels.length ? <Divider /> : null}
      />
    </ListEditor>
  );
};

export default ModelFuelsScreen;
