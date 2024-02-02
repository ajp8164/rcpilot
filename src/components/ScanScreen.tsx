import { AppTheme, useTheme } from 'theme';
import { Text, View } from 'react-native';

import CircleButton from 'components/atoms/CircleButton';
import React from 'react';
import { ScannerView } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rneui/themed';

const ScanScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  const onScan = (data: string) => {
    console.log(`scan data ${data}`);
  };

  const logEvent = () => {
  };

  const undoLastScan = () => {
  };

  const startEvent = () => {
  };

  return (
    <ScannerView
      onScan={onScan}
      OverlayComponent={
        <View style={s.overlay}>
          <Text style={[s.text, s.title]}>
            {'Scan a model or battery QR code\nto log an event'}
          </Text>
          <Text style={[s.text, s.scannedNames]}>
            {'Flight for Goblin Buddy'}
          </Text>
          <View style={s.buttonContainer}>
            <CircleButton icon={'share'} text={'Undo scan'} style={s.flip} onPress={undoLastScan}/>
            <CircleButton icon={'file-lines'} text={'Log event'} onPress={logEvent}/>
            <CircleButton icon={'plane-up'} text={'Start event'} onPress={startEvent}/>
          </View>
        </View>
      }/>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  buttonContainer: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    bottom: 40,
    justifyContent: 'space-around',
  },
  flip: {
    transform: [{rotate: '180deg'}],
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  scannedNames: {
    position: 'absolute',
    width: '100%',
    bottom: 120,
  },
  text: {
    ...theme.styles.textNormal,
    color: theme.colors.stickyWhite,
    textAlign: 'center',
  },
  title: {
    top: 150,
  },
}));

export default ScanScreen;
