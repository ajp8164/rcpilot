import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import {
  ListItem,
  listItemPosition,
  swipeableDeleteItem,
} from 'components/atoms/List';
import React, { useEffect } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rn-vui/base';
import { EmptyView } from 'components/molecules/EmptyView';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rn-vui/themed';
import { useConfirmAction } from 'lib/useConfirmAction';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'ModelPropellers'
>;

const ModelPropellersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const allModelPropellers = useQuery(ModelPropeller);

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<Icon name={'plus'} style={s.headerIcon} />}
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

  const deletePropeller = (propeller: ModelPropeller) => {
    realm.write(() => {
      realm.delete(propeller);
    });
  };

  const renderModelPropeller: ListRenderItem<ModelPropeller> = ({
    item: propeller,
    index,
  }) => {
    return (
      <ListItem
        ref={ref => {
          ref &&
            listEditor.add(ref, 'model-propellers', propeller._id.toString());
        }}
        key={propeller._id.toString()}
        title={propeller.name}
        position={listItemPosition(index, allModelPropellers.length)}
        onPress={() =>
          navigation.navigate('ModelPropellerEditor', {
            modelPropellerId: propeller._id.toString(),
          })
        }
        swipeable={{
          rightItems: [
            {
              ...swipeableDeleteItem[theme.mode],
              onPress: () =>
                confirmAction(deletePropeller, {
                  label: 'Delete Saved Filter',
                  title:
                    'This action cannot be undone.\nAre you sure you want to delete this propeller?',
                  value: propeller,
                }),
            },
          ],
        }}
        onSwipeableWillOpen={() =>
          listEditor.onItemWillOpen(
            'model-propellers',
            propeller._id.toString(),
          )
        }
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    );
  };

  if (!allModelPropellers.length) {
    return (
      <EmptyView
        info
        message={'No Model Propellers'}
        details={'Tap the + button to add your first model propeller.'}
      />
    );
  }

  return (
    <FlatList
      style={theme.styles.view}
      data={allModelPropellers}
      renderItem={renderModelPropeller}
      keyExtractor={(_item, index) => `${index}`}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={allModelPropellers.length ? <Divider /> : null}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
  },
}));

export default ModelPropellersScreen;
