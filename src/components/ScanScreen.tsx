import { ScannerView } from '@react-native-hello/ui';
import { makeStyles } from '@rn-vui/themed';
import { Button } from 'components/atoms/Button';
import { FileText, Plane, Share } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';

const ScanScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  const onScan = (data: string) => {
    console.log(`scan data ${data}`);
  };

  const logEvent = () => {
    console.log('log event');
  };

  const undoLastScan = () => {
    console.log('undo event');
  };

  const startEvent = () => {
    console.log('start event');
  };

  return (
    <ScannerView
      onScan={onScan}
      OverlayComponent={
        <View style={s.overlay}>
          <View style={[s.title]}>
            <Text style={s.text1}>{'Event for Goblin Buddy'}</Text>
            <Text style={s.text2}>
              {'Scan a model or battery QR code\nto log an event.'}
            </Text>
          </View>
          <View style={s.buttonBarContainer}>
            <Button
              title={'Undo Scan'}
              buttonStyle={theme.styles.buttonScreenHeader}
              containerStyle={s.buttonContainer}
              icon={<Share color={theme.colors.whiteTransparentMid} />}
              onPress={undoLastScan}
            />
            <Button
              title={'Log Event'}
              buttonStyle={theme.styles.buttonScreenHeader}
              containerStyle={s.buttonContainer}
              icon={<FileText color={theme.colors.whiteTransparentMid} />}
              onPress={logEvent}
            />
            <Button
              title={'Start Event'}
              buttonStyle={theme.styles.buttonScreenHeader}
              containerStyle={s.buttonContainer}
              icon={<Plane color={theme.colors.whiteTransparentMid} />}
              onPress={startEvent}
            />
          </View>
        </View>
      }
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  buttonBarContainer: {
    position: 'absolute',
    bottom: 40,
    right: 10,
    justifyContent: 'space-around',
  },
  buttonContainer: {
    paddingHorizontal: 5,
    marginTop: 10,
    height: 50,
    borderColor: theme.colors.whiteTransparentMid,
    borderWidth: 3.2,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  text1: {
    ...theme.styles.textXL,
    color: theme.colors.stickyWhite,
    textAlign: 'center',
  },
  text2: {
    ...theme.styles.textSmall,
    color: theme.colors.stickyWhite,
    textAlign: 'center',
  },
  title: {
    top: '15%',
  },
}));

export default ScanScreen;
