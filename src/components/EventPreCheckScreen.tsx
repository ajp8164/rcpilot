import { AppTheme, useTheme } from 'theme';
import { Checklist, ChecklistAction, ChecklistFrequencyUnit, ChecklistType } from 'types/model';
import { FlatList, ListRenderItem, View } from 'react-native';
import { ListItemCheckboxInfo, listItemPosition } from 'components/atoms/List';
import React, { useEffect } from 'react';

import ActionBar from 'components/atoms/ActionBar';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { EventNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<EventNavigatorParamList, 'EventPreCheck'>;

const EventPreCheckScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const checklist: Checklist = {
    id: '1',
    name: 'test',
    type: ChecklistType.PreCheck,
    actions: [
      {
        description: 'description',
        frequencyValue: 1,
        frequencyUnit: ChecklistFrequencyUnit.Event,
        repeats: false,
        notes: '',
      },
      {
        description: 'description',
        frequencyValue: 1,
        frequencyUnit: ChecklistFrequencyUnit.Event,
        repeats: false,
        notes: '',
      }
    ],
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title={'Done'}
          titleStyle={[theme.styles.buttonClearTitle, s.headerButton]}
          buttonStyle={[theme.styles.buttonClear, s.doneButton]}
          onPress={() => navigation.navigate('EventTimer', {
            eventId: '1'
          })}
        />
      ),
    });
  }, []);

  const renderItems: ListRenderItem<ChecklistAction> = ({ item: action, index }) => {
    return (
      <ListItemCheckboxInfo
        key={index}
        title={action.description}
        subtitle={'Performed before every flight'}
        iconChecked={'square-check'}
        iconUnchecked={'circle'}
        iconSize={28}
        checked={true}
        position={listItemPosition(index, checklist.actions.length)}
        onPress={() => null}
        onPressInfo={() => navigation.navigate('EventChecklistItem', {
          checklistId: '1',
          actionIndex: 0,
        })}
       /> 
    );
  };

  return (
    <View style={theme.styles.view}>
      <Divider text={`${checklist.type.toUpperCase()}`}/>
      <FlatList
        data={checklist.actions}
        renderItem={renderItems}
        keyExtractor={(_item, index) => `${index}`}
        showsVerticalScrollIndicator={false}
      />
      <ActionBar
        actions={[
          {
            label: 'Uncheck All Items',
            onPress: () => null
          }, {
            label: 'Check All Items',
            onPress: () => null
          },
        ]}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerButton: {
    color: theme.colors.stickyWhite,
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default EventPreCheckScreen;
