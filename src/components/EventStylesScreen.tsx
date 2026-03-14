import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItem } from 'react-native';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItemSwipeable,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { HeaderIconButton, headerOptions } from 'components/atoms/navigation';
import { EmptyView } from 'components/molecules/EmptyView';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Plus, Trash2 } from 'lucide-react-native';
import { BSON } from 'realm';
import { EventStyle } from 'realmdb/EventStyle';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'EventStyles'
>;

const EventStylesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const allEventStyles = useQuery(EventStyle);

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions(
      headerOptions({
        right: [
          <HeaderIconButton
            Icon={Plus}
            onPress={() => navigation.navigate('NewEventStyle', {})}
          />,
        ],
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteStyle = (eventId: string) => {
    const event = realm.objectForPrimaryKey(
      EventStyle,
      new BSON.ObjectId(eventId),
    );
    if (event?.isValid()) {
      realm.write(() => {
        realm.delete(event);
      });
    }
  };

  const renderEventStyle: ListRenderItem<EventStyle> = ({
    item: style,
    index,
  }) => {
    return (
      <ListItemSwipeable
        key={style._id.toString()}
        title={style.name}
        position={listItemPosition(index, allEventStyles.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() =>
          navigation.navigate('EventStyleEditor', {
            eventStyleId: style._id.toString(),
          })
        }
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
          draggable: true,
        }}
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: `Delete Style`,
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this event style?',
              });
            },
            onPress: () => deleteStyle(style._id.toString()),
          },
        ]}
      />
    );
  };

  if (!allEventStyles.length) {
    return (
      <EmptyView
        info
        message={'No Event Styles'}
        details={'Tap the + button to add an Event Style.'}
        buttonTitle={'Add Event Style'}
        onButtonPress={() => navigation.navigate('NewEventStyle', {})}
      />
    );
  }

  return (
    <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
      <FlatList
        style={theme.styles.view}
        data={allEventStyles}
        renderItem={renderEventStyle}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allEventStyles.length ? <Divider /> : null}
      />
    </ListEditor>
  );
};

export default EventStylesScreen;
