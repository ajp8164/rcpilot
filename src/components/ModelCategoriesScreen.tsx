import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItemSwipeable,
  listItemPosition,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { BSON } from 'realm';
import { ModelCategory } from 'realmdb/ModelCategory';
import { useTheme } from 'theme';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'ModelCategories'
>;

const ModelCategoriesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const allModelCategories = useQuery(ModelCategory);

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<Plus color={theme.colors.screenHeaderButtonText} />}
            onPress={() => navigation.navigate('NewModelCategory')}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteCategory = (modelCategoryId: string) => {
    const event = realm.objectForPrimaryKey(
      ModelCategory,
      new BSON.ObjectId(modelCategoryId),
    );
    if (event?.isValid()) {
      realm.write(() => {
        realm.delete(event);
      });
    }
  };

  const renderModelCategory: ListRenderItem<ModelCategory> = ({
    item: category,
    index,
  }) => {
    return (
      <ListItemSwipeable
        key={category._id.toString()}
        title={category.name}
        position={listItemPosition(index, allModelCategories.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() =>
          navigation.navigate('ModelCategoryEditor', {
            modelCategoryId: category._id.toString(),
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
                label: `Delete Style`,
                title:
                  "This action cannot be undone.\nAre you sure you don't want to log this model category?",
              });
            },
            onPress: () => deleteCategory(category._id.toString()),
          },
        ]}
      />
    );
  };

  if (!allModelCategories.length) {
    return (
      <EmptyView
        info
        message={'No Model Categories'}
        details={'Tap the + button to add your first model category.'}
      />
    );
  }

  return (
    <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
      <FlatList
        style={theme.styles.view}
        data={allModelCategories}
        renderItem={renderModelCategory}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allModelCategories.length ? <Divider /> : null}
      />
    </ListEditor>
  );
};

export default ModelCategoriesScreen;
