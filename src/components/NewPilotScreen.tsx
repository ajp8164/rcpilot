import React, { useEffect, useState } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemInput } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { useRealm } from '@realm/react';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'NewPilot'>;

const NewPilotScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const setScreenEditHeader = useScreenEditHeader();

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

    setScreenEditHeader({condition: canSave, action: onDone});
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

export default NewPilotScreen;
