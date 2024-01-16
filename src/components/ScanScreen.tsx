import { AppTheme, useTheme } from 'theme';
import { Pressable, Text, View } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome6';
import React from 'react';
import { ScannerView } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rneui/themed';
import { useHeaderHeight } from '@react-navigation/elements';

const ScanScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);
  const headerHeight = useHeaderHeight() + theme.insets.top - 7;

  const onScan = (data: string) => {
    console.log(`scan data ${data}`);
  };

  const logEvent = () => {
  };

  const undoLastScan = () => {
  };

  const startEvent = () => {
  };

  const Button = (props: {
    icon: string;
    text?: string;
    onPress: () => void;
    style?: any;
  }) => {
    const { icon, text, onPress, style } = props;
    return (
      <Pressable style={s.buttonWrapper} onPress={onPress}>
        <Icon
          name={'circle'}
          style={s.buttonOutline}
        />
        <Icon
          name={icon}
          style={[s.buttonIcon, style]}
        />
        <Text style={s.buttonText}>{text}</Text>
      </Pressable>
    )
  };

  return (
    <ScannerView
      containerStyle={{paddingTop: headerHeight}} 
      onScan={onScan}
      OverlayComponent={
        <View style={[s.overlay, {top: headerHeight}]}>
          <Text style={[s.text, s.title]}>
            {'Scan a model or battery QR code\nto log an event'}
          </Text>
          <Text style={[s.text, s.scannedNames]}>
            {'Flight for Goblin Buddy'}
          </Text>
          <View style={s.buttonContainer}>
            <Button icon={'share'} text={'Undo scan'} style={s.flip} onPress={undoLastScan}/>
            <Button icon={'file-lines'} text={'Log event'} onPress={logEvent}/>
            <Button icon={'plane-up'} text={'Start event'} onPress={startEvent}/>
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
  buttonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  buttonOutline: {
    color: theme.colors.whiteTransparentMid,
    fontSize: 50,
  },
  buttonIcon: {
    position: 'absolute',
    color: theme.colors.whiteTransparentMid,
    fontSize: 30,
  },
  buttonText: {
    ...theme.styles.textTiny,
    ...theme.styles.textBold,
    color: theme.colors.whiteTransparentMid,
    position: 'absolute',
    bottom: -20,
    textAlign: 'center',
    width: '100%',    
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
    top: 40,
  },
}));

export default ScanScreen;
