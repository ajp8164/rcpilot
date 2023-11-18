import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemCheckbox } from 'components/atoms/List';
import React, { useEffect } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { ModelFiltersNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { makeStyles } from '@rneui/themed';
import { modelTypes } from 'lib/model';

export type Props = NativeStackScreenProps<ModelFiltersNavigatorParamList, 'ModelFilterModelTypes'>;

const ModelFilterModelTypesScreen = ({ navigation }: Props) => {
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
          buttonStyle={[theme.styles.buttonClear, s.updateButton]}
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
      <Divider text={'MODEL TYPES TO INCLUDE IN RESULTS'}/>
      {modelTypes.map((type, index) => {
        return (
          <ListItemCheckbox
            key={index}
            title={type.name}
            position={modelTypes.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === modelTypes.length - 1 ? ['last'] : []}
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
  updateButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default ModelFilterModelTypesScreen;
