import React, { useEffect, useRef, useState } from 'react';
import { FlatList, LayoutRectangle, ListRenderItem, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { useCommanderSummary } from 'lib/commander';
import { useConfirmAction } from 'lib/useConfirmAction';
import { Plus, Trash2 } from 'lucide-react-native';
import { BSON } from 'realm';
import { Commander } from 'realmdb/Commander';
import { selectCommander } from 'store/selectors/commanderSelectors';
import { saveSelectedCommander } from 'store/slices/commander';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'Commanders'
>;

const CommandersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const unknownCommanders = useQuery(Commander, commanders =>
    commanders.filtered('unknownCommander == $0', true),
  );
  const unknownCommander = unknownCommanders[0];

  const allCommanders = useQuery(Commander, commanders =>
    commanders.filtered('unknownCommander == $0', false),
  );
  const selectedCommanderId = useSelector(selectCommander).commanderId;
  const commanderSummary = useCommanderSummary();

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listLayout, setListLayout] = useState<LayoutRectangle>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            headerRight
            icon={
              <Plus color={theme.colors.screenHeaderButtonText} size={28} />
            }
            onPress={() => navigation.navigate('NewCommander')}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCommander = (commander?: Commander) => {
    dispatch(
      saveSelectedCommander({
        commanderId: commander?._id?.toString(),
      }),
    );
  };

  const deleteCommander = (commanderId: string) => {
    const commander = realm.objectForPrimaryKey(
      Commander,
      new BSON.ObjectId(commanderId),
    );
    if (commander?.isValid()) {
      // Select the unknown commander if we delete the selected commander.
      if (commanderId === selectedCommanderId) {
        setCommander(unknownCommander);
      }

      realm.write(() => {
        realm.delete(commander);
      });
    }
  };

  const renderCommander: ListRenderItem<Commander> = ({
    item: commander,
    index,
  }) => {
    return (
      <ListItemCheckBoxInfo
        key={commander._id.toString()}
        title={commander.name}
        subtitle={commanderSummary(commander)}
        position={listItemPosition(index, allCommanders.length)}
        checked={commander._id.toString() === selectedCommanderId}
        listEditor={listEditorRef.current}
        onPress={() => setCommander(commander)}
        onPressInfo={() =>
          navigation.navigate('Commander', {
            commanderId: commander._id.toString(),
          })
        }
        swipeableActionsRight={[
          {
            text: 'Remove',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: 'Delete Commander',
                title: `This action cannot be undone.\nAre you sure you don't want to delete this commander?`,
              });
            },
            onPress: () => deleteCommander(commander._id.toString()),
          },
        ]}
      />
    );
  };

  const renderFooter = () => {
    return (
      <>
        {allCommanders && <Divider />}
        <ListItemCheckBoxInfo
          title={unknownCommander.name}
          subtitle={commanderSummary(unknownCommander)}
          position={['first', 'last']}
          hideInfo={true}
          checked={unknownCommander._id.toString() === selectedCommanderId}
          onPress={() => setCommander(unknownCommander)}
        />
        <Divider
          note
          light
          subHeaderStyle={theme.text.medium}
          text={
            'The Unknown Commander logs events not associated with a specific commander and model time not created by an app tracked event.'
          }
        />
      </>
    );
  };

  return (
    <ListEditor ref={listEditorRef} listLayout={listLayout}>
      <View
        style={[{ flex: 1 }]}
        onLayout={e => setListLayout(e.nativeEvent.layout)}>
        <FlatList
          style={theme.styles.view}
          data={allCommanders.slice()}
          renderItem={renderCommander}
          keyExtractor={item => item._id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={allCommanders.length ? <Divider /> : null}
          ListFooterComponent={renderFooter}
        />
      </View>
    </ListEditor>
  );
};

export default CommandersScreen;
