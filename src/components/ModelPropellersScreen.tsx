import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { ActionSheet } from 'react-native-ui-lib';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ModelPropellers'>;

const ModelPropellersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();

  const allModelPropellers = useQuery(ModelPropeller);
  const [deletePropellerActionSheetVisible, setDeletePropellerActionSheetVisible] = useState<ModelPropeller>();

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

  const confirmDeletePropeller = (propeller: ModelPropeller) => {
    setDeletePropellerActionSheetVisible(propeller);
  };

  const deletePropeller = (propeller: ModelPropeller) => {
    realm.write(() => {
      realm.delete(propeller);
    });
  };

  const renderItems: ListRenderItem<ModelPropeller> = ({ item: propeller, index }) => {
    return (
      <ListItem
        key={propeller._id.toString()}
        title={propeller.name}
        position={allModelPropellers.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allModelPropellers.length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('ModelPropellerEditor', {
          modelPropellerId: propeller._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            icon: 'delete',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => confirmDeletePropeller(propeller),
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
        data={allModelPropellers}
        renderItem={renderItems}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={Divider}
        ListEmptyComponent={
          <Text style={s.emptyList}>{'No Model Propellers'}</Text>
        }
      />
      <ActionSheet
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        options={[
          {
            label: 'Delete Propeller',
            onPress: () => {
              deletePropeller(deletePropellerActionSheetVisible!);
              setDeletePropellerActionSheetVisible(undefined);
            },
          },
          {
            label: 'Cancel' ,
            onPress: () => setDeletePropellerActionSheetVisible(undefined),
          },
        ]}
        useNativeIOS={true}
        visible={!!deletePropellerActionSheetVisible}
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

export default ModelPropellersScreen;
