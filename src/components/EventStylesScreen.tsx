import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { ActionSheet } from 'react-native-ui-lib';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { EventStyle } from 'realmdb/EventStyle';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'EventStyles'>;

const EventStylesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();

  const allEventStyles = useQuery(EventStyle);
  const [deleteStyleActionSheetVisible, setDeleteStyleActionSheetVisible] = useState<EventStyle>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
            icon={<Icon name={'plus'} style={s.headerIcon}/>}
            onPress={() => navigation.navigate('NewEventStyle', {})}
          />
        )
      },
    });
  }, []);

  const confirmDeleteStyle = (style: EventStyle) => {
    setDeleteStyleActionSheetVisible(style);
  };

  const deleteStyle = (style: EventStyle) => {
    realm.write(() => {
      realm.delete(style);
    });
  };

  const renderItems: ListRenderItem<EventStyle> = ({ item: style, index }) => {
    return (
      <ListItem
        key={style._id.toString()}
        title={style.name}
        position={allEventStyles.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allEventStyles.length - 1 ? ['last'] : []}
        onPress={() => navigation.navigate('EventStyleEditor', {
          eventStyleId: style._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            icon: 'trash',
            iconType: 'font-awesome',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => confirmDeleteStyle(style),
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
        data={allEventStyles}
        renderItem={renderItems}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={Divider}
        ListEmptyComponent={
          <Text style={s.emptyList}>{'No Event Styles'}</Text>
        }
      />
      <ActionSheet
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        options={[
          {
            label: 'Delete Style',
            onPress: () => {
              deleteStyle(deleteStyleActionSheetVisible!);
              setDeleteStyleActionSheetVisible(undefined);
            },
          },
          {
            label: 'Cancel' ,
            onPress: () => setDeleteStyleActionSheetVisible(undefined),
          },
        ]}
        useNativeIOS={true}
        visible={!!deleteStyleActionSheetVisible}
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  emptyList: {
    textAlign: 'center',
    marginTop: 180,
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
  },
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

export default EventStylesScreen;
