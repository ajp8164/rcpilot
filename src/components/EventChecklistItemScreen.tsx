import { AppTheme, useTheme } from 'theme';

import { Divider } from '@react-native-ajp-elements/ui';
import { EventNavigatorParamList } from 'types/navigation';
import { ListItem } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<EventNavigatorParamList, 'EventChecklistItem'>;

const EventChecklistItemScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <View style={theme.styles.view}>
      <Divider text={'ACTION'}/>
      <ListItem
        title={'action.description'}
        subtitle={'From checklist "Pre-Check"'}
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
        onPress={() => navigation.navigate('Notes', {
          headerButtonStyle: s.notesHeaderButtonStyle,
          eventName: 'event-checklist-item-notes',
        })}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  notesHeaderButtonStyle: {
    color: theme.colors.stickyWhite,
  }
}));

export default EventChecklistItemScreen;
