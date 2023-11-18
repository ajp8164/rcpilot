import { AppTheme, useTheme } from 'theme';
import { ChecklistAction, ChecklistFrequencyUnit } from 'types/model';

import { Divider } from '@react-native-ajp-elements/ui';
import { FlightNavigatorParamList } from 'types/navigation';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<FlightNavigatorParamList, 'FlightChecklistItem'>;

const FlightChecklistItemScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const action: ChecklistAction = {
    description: 'description',
    frequencyValue: 1,
    frequencyUnit: ChecklistFrequencyUnit.Event,
    repeats: false,
    notes: '',
  };

  return (
    <View style={theme.styles.view}>
      <Divider text={'ACTION'}/>
      <ListItem
        title={action.description}
        subtitle={'From checklist "Pre-Flight"'}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider text={'FREQUENCY'}/>
      <ListItem
        title={'Performed before every flight'}
        subtitle={'Last timee was on prior flight'}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider text={'NOTES'}/>
      <ListItem
        title={'Notes'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('Notes', {})}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default FlightChecklistItemScreen;
