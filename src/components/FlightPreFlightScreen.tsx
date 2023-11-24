import { AppTheme, useTheme } from 'theme';
import { Checklist, ChecklistFrequencyUnit, ChecklistType } from 'types/model';
import React, { useEffect } from 'react';

import ActionBar from 'components/atoms/ActionBar';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { FlightNavigatorParamList } from 'types/navigation';
import { ListItemCheckboxInfo } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<FlightNavigatorParamList, 'FlightPreFlight'>;

const FlightPreFlightScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const checklist: Checklist = {
    id: '1',
    name: 'test',
    type: ChecklistType.PreFlight,
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
          onPress={() => navigation.navigate('FlightTimer', {
            flightId: '1'
          })}
        />
      ),
    });
  }, []);

  return (
    <View style={theme.styles.view}>
      <Divider text={`${checklist.type.toUpperCase()}`}/>
      {checklist.actions.map((action, index) => {
        return (
          <ListItemCheckboxInfo
            key={index}
            title={action.description}
            subtitle={'Performed before every flight'}
            iconChecked={'square-check'}
            iconUnchecked={'circle'}
            iconSize={28}
            checked={true}
            position={checklist.actions.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === checklist.actions.length - 1 ? ['last'] : []}
            onPress={() => null}
            onPressInfo={() => navigation.navigate('FlightChecklistItem', {
              checklistId: '1',
              actionIndex: 0,
            })}
           /> 
        );
      })}
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

export default FlightPreFlightScreen;
