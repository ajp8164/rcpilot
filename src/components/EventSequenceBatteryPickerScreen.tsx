import { AppTheme, useTheme } from 'theme';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useObject, useQuery } from '@realm/react';

import { BSON } from 'realm';
import { Battery } from 'realmdb/Battery';
import BatteryPickerView from 'components/views/BatteryPickerView';
import { Button } from '@rneui/base';
import { EventSequenceNavigatorParamList } from 'types/navigation';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { eventSequence } from 'store/slices/eventSequence';
import { makeStyles } from '@rneui/themed';
import { selectEventSequence } from 'store/selectors/eventSequence';
import { useConfirmAction } from 'lib/useConfirmAction';

export type Props = NativeStackScreenProps<EventSequenceNavigatorParamList, 'EventSequenceBatteryPicker'>;

const EventSequenceBatteryPickerScreen = ({ navigation, route }: Props) => {
  const { cancelable } = route.params;

  const theme = useTheme();
  const s = useStyles(theme);
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();

  const activeBatteries = useQuery(Battery, batteries => { return batteries.filtered('retired == $0', false) }, []);
  const currentEventSequence = useSelector(selectEventSequence);
  const model = useObject(Model, new BSON.ObjectId(currentEventSequence.modelId));

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        if (cancelable) {
          return (
            <Button
              title={'Cancel'}
              titleStyle={theme.styles.buttonInvScreenHeaderTitle}
              buttonStyle={[theme.styles.buttonInvScreenHeader, s.headerButton]}
              onPress={() => confirmAction('Do Not Log Event', undefined, cancelEvent)}
            />
          )
        }
      },
      headerRight: () => {
        return (
          <>
            <Button
              title={'Checklist'}
              titleStyle={theme.styles.buttonInvScreenHeaderTitle}
              buttonStyle={[theme.styles.buttonInvScreenHeader, s.headerButton]}
              onPress={() => 
                navigation.navigate('EventSequencePreCheck', {cancelable: false})
              }
            />
            <Icon
              name={'chevron-right'}
              color={theme.colors.stickyWhite}
              size={22}
              style={s.headerIcon}
            />
          </>
        )
      },
    });
  }, []);

  const cancelEvent = () => {
    dispatch(eventSequence.reset());
    navigation.goBack();
  };

  const onSelect = (selected: Battery[]) => {
    dispatch(eventSequence.setBatteries({batteryIds: selected.map(b => b._id.toString())}));
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

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  headerIcon: {
    paddingLeft: 5
  },
}));

export default EventSequenceBatteryPickerScreen;
