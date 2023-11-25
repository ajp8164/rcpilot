import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemCheckbox } from 'components/atoms/List';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'theme';

const eventStyles = [
  { name: '3D' },
  { name: 'Sport' },
  { name: 'None' },
];

const EventStyleScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      {eventStyles.map((style, index) => {
        return (
          <ListItemCheckbox
            key={index}
            title={style.name}
            position={eventStyles.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === eventStyles.length - 1 ? ['last'] : []}
            checked={index === 0}
            onPress={() => null}
          />)
      })}
      <Divider text={'You can manage styles through the Globals section in the Setup tab.'} />
    </SafeAreaView>
  );
};

export default EventStyleScreen;
