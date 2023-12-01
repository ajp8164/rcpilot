import { AppTheme, useTheme } from 'theme';
import React, { useEffect } from 'react';

import { Button } from '@rneui/base';
import EventStyleEditorView from 'components/views/EventStyleEditorView';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'EventStyleEditor'>;

const EventStyleEditorScreen = ({ navigation, route }: Props) => {
  const { eventStyleId } = route.params;
  const theme = useTheme();
  const s = useStyles(theme);

  useEffect(() => {
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
      headerRight: ()  => {
        return (
          <Button
            title={'Done'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.doneButton]}
            onPress={onDone}
          />
        )
      },
    });
  }, []);

  const onDone = () => {};

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
        <EventStyleEditorView eventStyleId={eventStyleId} />
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

export default EventStyleEditorScreen;
