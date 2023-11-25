import { AppTheme, useTheme } from 'theme';
import { ModelsNavigatorParamList, SetupNavigatorParamList } from 'types/navigation';

import { Divider } from '@react-native-ajp-elements/ui';
import { FlightOutcome } from 'types/flight';
import {FlightRating} from 'components/molecules/FlightRating'
import { ListItemCheckbox } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = 
  NativeStackScreenProps<SetupNavigatorParamList, 'FlightOutcome'> &
  NativeStackScreenProps<ModelsNavigatorParamList, 'FlightOutcome'>;

const FlightOutcomeScreen = ({ route }:  Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const options = Object.values(FlightOutcome);

  const outcome = route.params.flightOutcome;

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      {options.map((value, index) => {
        return (
          <ListItemCheckbox
            key={index}
            leftImage={
              <View style={s.ratingContainer}>
                <FlightRating value={value}/>
              </View>
            }
            position={options.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === options.length - 1 ? ['last'] : []}
            checked={outcome === value}
            onPress={() => null}
          />)
      })}
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  ratingContainer: {
    width: 200,
  }
}));

export default FlightOutcomeScreen;
