import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useConfirmAction } from 'lib/useConfirmAction';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'ModelPropellers'>;

const ModelPropellersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const allModelPropellers = useQuery(ModelPropeller);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            icon={<Icon name={'plus'} style={s.headerIcon}/>}
            onPress={() => navigation.navigate('NewModelPropellerNavigator', {
              screen: 'NewModelPropeller',
            })}
          />
        )
      },
    });
  }, []);

  const deletePropeller = (propeller: ModelPropeller) => {
    realm.write(() => {
      realm.delete(propeller);
    });
  };

  const renderModelPropeller: ListRenderItem<ModelPropeller> = ({ item: propeller, index }) => {
    return (
      <ListItem
        ref={ref => listEditor.add(ref, 'model-propellers', index)}
        key={propeller._id.toString()}
        title={propeller.name}
        position={listItemPosition(index, allModelPropellers.length)}
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
            onPress: () => confirmAction('Delete Propeller', propeller, deletePropeller),
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('model-propellers', index)}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  if (!allModelPropellers.length) {
    return (
      <EmptyView info message={'No Model Propellers'} details={"Tap the + button to add your first model propeller."} />
    );    
  }

  return (
    <>
      <FlatList
        data={allModelPropellers}
        renderItem={renderModelPropeller}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allModelPropellers.length ? <Divider /> : null}
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

export default ModelPropellersScreen;
