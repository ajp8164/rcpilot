import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem } from 'react-native';
import React, { useEffect } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { ModelCategory } from 'realmdb/ModelCategory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useQuery } from '@realm/react';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ModelCategories'>;

const ModelCategoriesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const allModelCategories = useQuery(ModelCategory);

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

  const renderItems: ListRenderItem<ModelCategory> = ({ item, index }) => {
    return (
      <ListItem
        key={item._id.toString()}
        title={item.name}
        position={allModelCategories.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allModelCategories.length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ModelCategoryEditor', {
          modelCategoryId: item._id.toString(),
        })}
      />
    )
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      <FlatList
        data={allModelCategories}
        renderItem={renderItems}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
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

export default ModelCategoriesScreen;
