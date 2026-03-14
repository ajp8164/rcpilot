import React, { useEffect, useRef, useState } from 'react';
import {
  SectionList,
  SectionListData,
  SectionListRenderItem,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItemSwipeable,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { HeaderIconButton, headerOptions } from 'components/atoms/navigation';
import { EmptyView } from 'components/molecules/EmptyView';
import {
  batteryCycleDescription,
  batteryCycleTitle,
  useBatteryCyclesFilter,
} from 'lib/batteryCycle';
import { groupItems } from 'lib/sectionList';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Funnel, FunnelPlus, Trash2 } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { BatteryCycle } from 'realmdb/BatteryCycle';
import { selectFilters } from 'store/selectors/filterSelectors';
import { FilterType } from 'types/filter';
import { BatteriesNavigatorParamList } from 'types/navigation';

type Section = {
  title?: string;
  data: BatteryCycle[];
};

export type Props = NativeStackScreenProps<
  BatteriesNavigatorParamList,
  'BatteryCycles'
>;

const BatteryCyclesScreen = ({ navigation, route }: Props) => {
  const { batteryId } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const confirmAction = useConfirmAction();
  const realm = useRealm();

  const filterId = useSelector(selectFilters(FilterType.BatteryCyclesFilter));
  const batteryCycles = useBatteryCyclesFilter({ batteryId });
  const battery = useObject(Battery, new BSON.ObjectId(batteryId));

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions(
      headerOptions({
        right: [
          <HeaderIconButton
            disabled={
              !filterId && (!batteryCycles.length || listEditorState?.enabled)
            }
            Icon={filterId ? FunnelPlus : Funnel}
            onPress={() =>
              navigation.navigate('BatteryCycleFiltersNavigator', {
                screen: 'BatteryCycleFilters',
                params: {
                  useGeneralFilter: true,
                },
              })
            }
          />,
          <Button
            title={listEditorState?.enabled ? 'Done' : 'Edit'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            disabled={!batteryCycles.length}
            onPress={() => listEditorRef.current?.onToggleEditMode()}
          />,
        ],
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterId, listEditorState?.enabled]);

  const groupCycles = (
    cycles?: BatteryCycle[],
  ): SectionListData<BatteryCycle, Section>[] => {
    return groupItems<BatteryCycle, Section>(cycles || [], cycle => {
      const date = cycle.charge?.date || cycle.discharge?.date;
      return date
        ? DateTime.fromISO(date).toFormat('MMMM yyyy').toUpperCase()
        : '';
    });
  };

  const deleteCycle = (cycleNumber: number) => {
    if (battery) {
      realm.write(() => {
        const index = batteryCycles.findIndex(
          c => c.cycleNumber === cycleNumber,
        );
        if (index !== undefined && index >= 0) {
          // Make sure to decrement the battery's total cycle count.
          realm.delete(batteryCycles[index]);
          if (battery.totalCycles) {
            battery.totalCycles = battery.totalCycles - 1;
          }
        }
      });
    }
  };

  const renderBatteryCycle: SectionListRenderItem<BatteryCycle, Section> = ({
    item: cycle,
    section,
    index,
  }: {
    item: BatteryCycle;
    section: Section;
    index: number;
  }) => {
    return (
      <ListItemSwipeable
        key={cycle._id.toString()}
        title={batteryCycleTitle(cycle)}
        subtitle={batteryCycleDescription(cycle)}
        subtitleStyle={[theme.text.tiny, theme.styles.textDim]}
        subtitleLines={3}
        position={listItemPosition(index, section.data.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() => {
          navigation.navigate('BatteryCycleEditor', {
            batteryId,
            cycleNumber: cycle.cycleNumber,
          });
        }}
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
                label: 'Delete Cycle',
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this battery cycle?',
              });
            },
            onPress: () => deleteCycle(cycle.cycleNumber),
          },
        ]}
      />
    );
  };

  if (!battery) {
    return <EmptyView error message={'Battery Not Found!'} />;
  }

  if (filterId && !batteryCycles.length) {
    return (
      <EmptyView
        message={'No Battery Cycles Match Your Filter'}
        details={'Adjust your filter settings to see your battery cycles.'}
        buttonTitle={'Adjust Filter'}
        onButtonPress={() =>
          navigation.navigate('BatteryCycleFiltersNavigator', {
            screen: 'BatteryCycleFilters',
            params: {
              useGeneralFilter: true,
            },
          })
        }
      />
    );
  }

  if (!batteryCycles.length) {
    return (
      <EmptyView
        info
        message={'No Battery Cycles'}
        details={'Tap the battery on the Batteries tab to add a new cycle.'}
      />
    );
  }

  return (
    <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
      <SectionList
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        stickySectionHeadersEnabled={true}
        style={[theme.styles.view, s.sectionList]}
        sections={groupCycles([...batteryCycles].reverse())} // Most recent cycles at the top
        keyExtractor={(item, index) => `${index}${item.cycleNumber}`}
        renderItem={renderBatteryCycle}
        renderSectionHeader={({ section: { title } }) => (
          <View style={theme.styles.listSectionHeader}>
            <Divider text={title} />
          </View>
        )}
        ListFooterComponent={<Divider />}
      />
    </ListEditor>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  sectionList: {
    flex: 1,
    flexGrow: 1,
  },
}));

export default BatteryCyclesScreen;
