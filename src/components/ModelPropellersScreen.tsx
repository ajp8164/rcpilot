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
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'ModelPropellers'
>;

const ModelPropellersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const allModelPropellers = useQuery(ModelPropeller);

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
              navigation.navigate('NewModelPropellerNavigator', {
                screen: 'NewModelPropeller',
              })
            }
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deletePropeller = (modelPropellerId: string) => {
    const event = realm.objectForPrimaryKey(
      ModelPropeller,
      new BSON.ObjectId(modelPropellerId),
    );
    if (event?.isValid()) {
      realm.write(() => {
        realm.delete(event);
      });
    }
  };

  const renderModelPropeller: ListRenderItem<ModelPropeller> = ({
    item: propeller,
    index,
  }) => {
    return (
      <ListItemSwipeable
        key={propeller._id.toString()}
        title={propeller.name}
        position={listItemPosition(index, allModelPropellers.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() =>
          navigation.navigate('ModelPropellerEditor', {
            modelPropellerId: propeller._id.toString(),
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
              listEditorRef.current?.reset();
              return confirmAction({
                label: `Delete Propeller`,
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this propeller?',
              });
            },
            onPress: () => deletePropeller(propeller._id.toString()),
          },
        ]}
      />
    );
  };

  if (!allModelPropellers.length) {
    return (
      <EmptyView
        info
        message={'No Model Propellers'}
        details={'Tap the + button to add a model propeller.'}
        buttonTitle={'Add Model Propeller'}
        onButtonPress={() =>
          navigation.navigate('NewModelPropellerNavigator', {
            screen: 'NewModelPropeller',
          })
        }
      />
    );
  }

  return (
    <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
      <FlatList
        style={theme.styles.view}
        data={allModelPropellers}
        renderItem={renderModelPropeller}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allModelPropellers.length ? <Divider /> : null}
      />
    </ListEditor>
  );
};

export default ModelPropellersScreen;
