import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useQuery } from '@realm/react';
import {
  HeaderButton,
  HeaderIconButton,
  headerOptions,
} from 'components/atoms/navigation';
import BatteryPickerView from 'components/views/BatteryPickerView';
import { modelHasChecklists } from 'lib/model';
import { ChevronRight, X } from 'lucide-react-native';
import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import { Model } from 'realmdb/Model';
import { selectEventSequence } from 'store/selectors/eventSequence';
import { eventSequence } from 'store/slices/eventSequence';
import { ChecklistType } from 'types/checklist';
import { EventSequenceNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  EventSequenceNavigatorParamList,
  'EventSequenceBatteryPicker'
>;

const EventSequenceBatteryPickerScreen = ({ navigation, route }: Props) => {
  const { cancelable } = route.params;

  const theme = useTheme();
  const dispatch = useDispatch();

  const activeBatteries = useQuery(
    Battery,
    batteries => {
      return batteries.filtered('retired == $0', false);
    },
    [],
  );
  const currentEventSequence = useSelector(selectEventSequence);
  const model = useObject(
    Model,
    new BSON.ObjectId(currentEventSequence.modelId),
  );

  useEffect(() => {
    const hasChecklists =
      model && modelHasChecklists(model, ChecklistType.PreEvent);

    navigation.setOptions(
      headerOptions({
        left: cancelable
          ? [
              <HeaderIconButton
                Icon={X}
                color={theme.colors.stickyWhite}
                onPress={cancelEvent}
              />,
            ]
          : [],
        right: [
          <HeaderButton
            label={hasChecklists ? 'Checklist' : 'Timer'}
            Icon={ChevronRight}
            iconRight
            color={theme.colors.stickyWhite}
            onPress={() => {
              if (hasChecklists) {
                navigation.navigate('EventSequenceChecklist', {
                  cancelable: false,
                  checklistType: ChecklistType.PreEvent,
                });
              } else {
                navigation.navigate('EventSequenceTimer', {});
              }
            }}
          />,
        ],
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelEvent = () => {
    dispatch(eventSequence.reset());
    navigation.goBack();
  };

  const onSelect = (selected: Battery[]) => {
    dispatch(
      eventSequence.setBatteries({
        batteryIds: selected.map(b => b._id.toString()),
      }),
    );
  };

  return (
    <View style={theme.styles.view}>
      <BatteryPickerView
        batteries={activeBatteries}
        favoriteBatteries={model?.favoriteBatteries}
        mode={'many'}
        onSelect={onSelect}
      />
    </View>
  );
};

export default EventSequenceBatteryPickerScreen;
