import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { ActionSheet } from 'react-native-ui-lib';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
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
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            icon={<Icon name={'plus'} style={s.headerIcon}/>}
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
            icon: 'trash',
            iconType: 'font-awesome',
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
          <EmptyView info message={'No Model Propellers'} details={"Tap the + button to add your first model propeller."} />
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

export default ModelPropellersScreen;
