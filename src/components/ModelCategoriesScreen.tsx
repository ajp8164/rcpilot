import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { ActionSheet } from 'react-native-ui-lib';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { ModelCategory } from 'realmdb/ModelCategory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ModelCategories'>;

const ModelCategoriesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();

  const allModelCategories = useQuery(ModelCategory);
  const [deleteCategoryActionSheetVisible, setDeleteCategoryActionSheetVisible] = useState<ModelCategory>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            type={'clear'}
            icon={ <Icon name={'plus'} style={s.addIcon} /> }
            onPress={() => navigation.navigate('NewModelCategory')}
          />
        )
      },
    });
  }, []);

  const confirmDeleteCategory = (category: ModelCategory) => {
    setDeleteCategoryActionSheetVisible(category);
  };

  const deleteCategory = (category: ModelCategory) => {
    realm.write(() => {
      realm.delete(category);
    });
  };

  const renderItems: ListRenderItem<ModelCategory> = ({ item: category, index }) => {
    return (
      <ListItem
        key={category._id.toString()}
        title={category.name}
        position={allModelCategories.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allModelCategories.length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ModelCategoryEditor', {
          modelCategoryId: category._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            icon: 'delete',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => confirmDeleteCategory(category),
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
        data={allModelCategories}
        renderItem={renderItems}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={Divider}
        ListEmptyComponent={
          <Text style={s.emptyList}>{'No Model Categories'}</Text>
        }
      />
      <ActionSheet
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        options={[
          {
            label: 'Delete Category',
            onPress: () => {
              deleteCategory(deleteCategoryActionSheetVisible!);
              setDeleteCategoryActionSheetVisible(undefined);
            },
          },
          {
            label: 'Cancel' ,
            onPress: () => setDeleteCategoryActionSheetVisible(undefined),
          },
        ]}
        useNativeIOS={true}
        visible={!!deleteCategoryActionSheetVisible}
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  addIcon: {
    color: theme.colors.brandPrimary,
    fontSize: 22,
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 180,
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
  },
}));

export default ModelCategoriesScreen;
