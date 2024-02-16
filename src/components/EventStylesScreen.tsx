import { AppTheme, useTheme } from 'theme';
import { Divider, useListEditor } from '@react-native-ajp-elements/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItem, listItemPosition } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import { EmptyView } from 'components/molecules/EmptyView';
import { EventStyle } from 'realmdb/EventStyle';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useConfirmAction } from 'lib/useConfirmAction';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'EventStyles'>;

const EventStylesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const listEditor = useListEditor();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const allEventStyles = useQuery(EventStyle);

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

  const deleteStyle = (style: EventStyle) => {
    realm.write(() => {
      realm.delete(style);
    });
  };

  const renderEventStyle: ListRenderItem<EventStyle> = ({ item: style, index }) => {
    return (
      <ListItem
        ref={ref => ref && listEditor.add(ref, 'event-styles', style._id.toString())}
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
            onPress: () => confirmAction('Delete Style', style, deleteStyle),
          }]
        }}
        onSwipeableWillOpen={() => listEditor.onItemWillOpen('event-styles', style._id.toString())}
        onSwipeableWillClose={listEditor.onItemWillClose}
      />
    )
  };

  if (!allEventStyles.length) {
    return (
      <EmptyView info message={'No Event Styles'} details={"Tap the + button to add your first event style."} />
    )
  }

  return (
    <FlatList
      style={theme.styles.view}
      data={allEventStyles}
      renderItem={renderEventStyle}
      keyExtractor={item => item._id.toString()}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={allEventStyles.length ? <Divider /> : null}
    />
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
