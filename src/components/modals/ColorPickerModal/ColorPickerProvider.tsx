import { View } from 'react-native';
import { ColorPickerContext } from './ColorPickerContext';
import React, { ReactNode, useRef } from 'react';
import { ColorPickerModal } from './ColorPickerModal';
import { makeStyles } from '@rneui/themed';
import { AppTheme, useTheme } from 'theme';

export const ColorPickerProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const theme = useTheme();
  const s = useStyles(theme);

  const modalRef = useRef<ColorPickerModal>(null);
  const eyedropperViewRef = useRef<View>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extraDataRef = useRef<any>();

  const onDismiss = () => {
    return;
  };

  return (
    <ColorPickerContext.Provider
      value={{
        extraData: extraDataRef,
        modal: modalRef,
        onDismiss,
      }}>
      <View ref={eyedropperViewRef} style={s.view}>
        {children}
        <ColorPickerModal ref={modalRef} eyedropperViewRef={eyedropperViewRef} />
      </View>
    </ColorPickerContext.Provider>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  view: {
    width: '100%',
    height: '100%',
  },
}));
