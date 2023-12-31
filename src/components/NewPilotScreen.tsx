import { AppTheme, useTheme } from 'theme';
import React, { useEffect, useState } from 'react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemInput } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { useRealm } from '@realm/react';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'NewPilot'>;

const NewPilotScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();

  const [name, setName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const canSave = name !== undefined;

    const save = () => {
      realm.write(() => {
        realm.create('Pilot', {
          name
        });
      });
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
            onPress={navigation.goBack}
          />
        )
      },
      headerRight: () => {
        if (canSave) {
          return (
            <Button
              title={'Done'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.doneButton]}
              onPress={onDone}
            />
          )
        }
      },
    });
  }, [name]);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      <ListItemInput
        value={name}
        placeholder={"New Pilot's Name"}
        position={['first', 'last']}
        onChangeText={setName}
      /> 
    </SafeAreaView>
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

export default NewPilotScreen;
