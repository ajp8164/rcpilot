import { ColorPickerContext } from './ColorPickerContext';
import { ColorPickerModal } from './ColorPickerModal';
import { ThemeManager } from '@react-native-hello/ui';
import React, { ReactNode, useRef, useState } from 'react';
import { ColorValue, View } from 'react-native';

export const ColorPickerProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const s = useStyles();

  const modalRef = useRef<ColorPickerModal>(null);
  const eyedropperViewRef = useRef<View>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extraDataRef = useRef<any>(null);

  const [recentColors, setRecentColors] = useState<ColorValue[]>([]);

  const onDismiss = () => {
    return;
  };

  const onEyedropper = () => {
    return;
  };

  return (
    <ColorPickerContext.Provider
      value={{
        extraData: extraDataRef,
        modal: modalRef,
        recentColors,
        onDismiss,
        onEyedropper,
        setRecentColors,
      }}>
      <View ref={eyedropperViewRef} style={s.view}>
        {children}
        <ColorPickerModal
          ref={modalRef}
          eyedropperViewRef={eyedropperViewRef as React.RefObject<View>}
        />
      </View>
    </ColorPickerContext.Provider>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  view: {
    width: '100%',
    height: '100%',
  },
}));
