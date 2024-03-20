import React, { useEffect, useRef } from 'react';

import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemInput } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { View } from 'react-native';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useRealm } from '@realm/react';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'NewPilot'>;

const NewPilotScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const setDebounced = useDebouncedRender();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();

  const name = useRef<string | undefined>(undefined);

  useEffect(() => {
    const canSave = name.current !== undefined;

    const save = () => {
      const now = DateTime.now().toISO();
      realm.write(() => {
        realm.create('Pilot', {
          createdOn: now,
          updatedOn: now,
          name: name.current,
        });
      });
    };

    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({ enabled: canSave, action: onDone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name.current]);

  return (
    <View style={theme.styles.view}>
      <Divider />
      <ListItemInput
        value={name.current}
        placeholder={"New Pilot's Name"}
        position={['first', 'last']}
        onChangeText={value => setDebounced(() => (name.current = value))}
      />
    </View>
  );
};

export default NewPilotScreen;
