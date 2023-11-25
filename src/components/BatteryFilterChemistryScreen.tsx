import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemCheckbox } from 'components/atoms/List';
import React, { useEffect } from 'react';

import { BatteryFiltersNavigatorParamList } from 'types/navigation';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { chemistries } from 'lib/battery';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<BatteryFiltersNavigatorParamList, 'BatteryFilterChemistry'>;

const BatteryFilterChemistryScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          title={'Cancel'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
          onPress={() => navigation.goBack()}
        />
      ),
      headerRight: () => (
        <Button
          title={'Done'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.doneButton]}
          onPress={() => null}
        />
      ),
    });
  }, []);

  return (
    <View style={theme.styles.view}>
      <Divider />
      <ListItem
        title={'Select All'}
        position={['first']}
        rightImage={false}
        onPress={() => null}
      />
      <ListItem
        title={'Select None'}
        position={['last']}
        rightImage={false}
        onPress={() => null}
      />
      <Divider text={'CHEMISTRIES TO INCLUDE IN RESULTS'}/>
      {chemistries.map((chemistry, index) => {
        return (
          <ListItemCheckbox
            key={index}
            title={chemistry.name}
            position={chemistries.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === chemistries.length - 1 ? ['last'] : []}
            checked={index === 0}
            onPress={() => null}
          />)
      })}
    </View>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default BatteryFilterChemistryScreen;
