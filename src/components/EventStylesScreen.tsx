import { AppTheme, useTheme } from 'theme';
import { Divider, ListEditorView, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { ActionSheet } from 'react-native-ui-lib';
import { Button } from '@rneui/base';
import { EmptyView } from 'components/molecules/EmptyView';
import { EventStyle } from 'realmdb/EventStyle';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'EventStyles'>;

const EventStylesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
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

  const renderEventStyle: ListRenderItem<EventStyle> = ({ item: style, index }) => {
    return (
      <ListItem
        ref={ref => listEditor.add(ref, 'event-styles', index)}
        key={style._id.toString()}
        title={style.name}
        position={listItemPosition(index, allEventStyles.length)}
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
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('event-styles', index)}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  return (
    <ListEditorView
      style={theme.styles.view}
      editorEnabledBySwipe={listEditor.enabledBySwipe}
      resetEditor={listEditor.reset}>
      <FlatList
        data={allEventStyles}
        renderItem={renderEventStyle}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={Divider}
        ListEmptyComponent={
          <EmptyView info message={'No Event Styles'} details={"Tap the + button to add your first event style."} />
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
    </ListEditorView>
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

export default EventStylesScreen;
