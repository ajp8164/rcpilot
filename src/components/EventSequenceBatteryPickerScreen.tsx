import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject, useQuery } from '@realm/react';
import { Button } from 'components/atoms/Button';
import BatteryPickerView from 'components/views/BatteryPickerView';
import { modelHasChecklists } from 'lib/model';
import { eventKind } from 'lib/modelEvent';
import { useConfirmAction } from 'lib/useConfirmAction';
import { ChevronRight } from 'lucide-react-native';
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
  const s = useStyles();
  const confirmAction = useConfirmAction();
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
  const [kind] = useState(eventKind(model?.type));

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        if (cancelable) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={{
                ...theme.styles.buttonScreenHeaderTitle,
                ...s.buttonScreenHeaderTitleLeft,
              }}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={() =>
                confirmAction(
                  {
                    label: `Do Not Log ${kind.name}`,
                    title: `This action cannot be undone.\nAre you sure you don't want to log this ${kind.name}?`,
                  },
                  cancelEvent,
                )
              }
            />
          );
        }
      },
      headerRight: () => {
        const hasChecklists =
          model && modelHasChecklists(model, ChecklistType.PreEvent);
        return (
          <Button
            title={hasChecklists ? 'Checklist' : 'Timer'}
            titleStyle={{
              ...theme.styles.buttonScreenHeaderTitle,
              ...s.buttonScreenHeaderTitleRight,
            }}
            buttonStyle={theme.styles.buttonScreenHeader}
            iconRight
            icon={
              <ChevronRight
                color={theme.colors.stickyWhite}
                size={33}
                style={{ right: -10 }}
              />
            }
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
          />
        );
      },
    });
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

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  buttonScreenHeaderTitleLeft: {
    color: theme.colors.stickyWhite,
  },
  buttonScreenHeaderTitleRight: {
    right: 15,
    color: theme.colors.stickyWhite,
  },
}));

export default EventSequenceBatteryPickerScreen;
