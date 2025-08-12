import {
  Divider,
  ListEditor,
  ListEditorMethods,
  listItemPosition,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { usePilotSummary } from 'lib/pilot';
import { useConfirmAction } from 'lib/useConfirmAction';
import { Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, LayoutRectangle, ListRenderItem, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BSON } from 'realm';
import { Pilot } from 'realmdb/Pilot';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { saveSelectedPilot } from 'store/slices/pilot';
import { useTheme } from 'theme';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Pilots'>;

const PilotsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const unknownPilots = useQuery(Pilot, pilots =>
    pilots.filtered('unknownPilot == $0', true),
  );
  const unknownPilot = unknownPilots[0];

  const allPilots = useQuery(Pilot, pilots =>
    pilots.filtered('unknownPilot == $0', false),
  );
  const selectedPilotId = useSelector(selectPilot).pilotId;
  const pilotSummary = usePilotSummary();

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listLayout, setListLayout] = useState<LayoutRectangle>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<Plus color={theme.colors.screenHeaderButtonText} />}
            onPress={() => navigation.navigate('NewPilot')}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPilot = (pilot?: Pilot) => {
    dispatch(
      saveSelectedPilot({
        pilotId: pilot?._id?.toString(),
      }),
    );
  };

  const deletePilot = (pilotId: string) => {
    const pilot = realm.objectForPrimaryKey(Pilot, new BSON.ObjectId(pilotId));
    if (pilot?.isValid()) {
      // Select the unknown pilot if we delete the selected pilot.
      if (pilotId === selectedPilotId) {
        setPilot(unknownPilot);
      }

      realm.write(() => {
        realm.delete(pilot);
      });
    }
  };

  const renderPilot: ListRenderItem<Pilot> = ({ item: pilot, index }) => {
    return (
      <ListItemCheckBoxInfo
        key={pilot._id.toString()}
        title={pilot.name}
        subtitle={pilotSummary(pilot)}
        position={listItemPosition(index, allPilots.length)}
        checked={pilot._id.toString() === selectedPilotId}
        listEditor={listEditorRef.current}
        onPress={() => setPilot(pilot)}
        onPressInfo={() =>
          navigation.navigate('Pilot', {
            pilotId: pilot._id.toString(),
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
                label: 'Delete Pilot',
                title: `This action cannot be undone.\nAre you sure you don't want to delete this pilot?`,
              });
            },
            onPress: () => deletePilot(pilot._id.toString()),
          },
        ]}
      />
    );
  };

  const renderFooter = () => {
    return (
      <>
        {allPilots && <Divider />}
        <ListItemCheckBoxInfo
          title={unknownPilot.name}
          subtitle={pilotSummary(unknownPilot)}
          position={['first', 'last']}
          hideInfo={true}
          checked={unknownPilot._id.toString() === selectedPilotId}
          onPress={() => setPilot(unknownPilot)}
        />
        <Divider
          note
          light
          text={
            'Includes events logged with an "Unknown" pilot and model time not directly associated with an event.'
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
          data={allPilots.slice()}
          renderItem={renderPilot}
          keyExtractor={item => item._id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={allPilots.length ? <Divider /> : null}
          ListFooterComponent={renderFooter}
        />
      </View>
    </ListEditor>
  );
};

export default PilotsScreen;
