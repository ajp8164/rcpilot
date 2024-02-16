import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ModelCategory } from 'realmdb/ModelCategory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useConfirmAction } from 'lib/useConfirmAction';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ModelCategories'>;

const ModelCategoriesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const allModelCategories = useQuery(ModelCategory);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            icon={<Icon name={'plus'} style={s.headerIcon}/>}
            onPress={() => navigation.navigate('NewModelCategory')}
          />
        )
      },
    });
  }, []);

  const deleteCategory = (category: ModelCategory) => {
    realm.write(() => {
      realm.delete(category);
    });
  };

  const renderModelCategory: ListRenderItem<ModelCategory> = ({ item: category, index }) => {
    return (
      <ListItem
        ref={ref => ref && listEditor.add(ref, 'model-categories', category._id.toString())}
        key={category._id.toString()}
        title={category.name}
        position={listItemPosition(index, allModelCategories.length)}
        onPress={() => navigation.navigate('ModelCategoryEditor', {
          modelCategoryId: category._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            icon: 'trash',
            iconType: 'font-awesome',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => confirmAction('Delete Category', category, deleteCategory),
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('model-categories', category._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  if (!allModelCategories.length) {
    return (
      <EmptyView info message={'No Model Categories'} details={"Tap the + button to add your first model category."} />
    );
  }

  return (
    <>
      <FlatList
        data={allModelCategories}
        renderItem={renderModelCategory}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allModelCategories.length ? <Divider /> : null}
      />
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

export default ModelCategoriesScreen;
