import { Keyboard, KeyboardEvent } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * Shows height of keyboard when shown
 */
export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  function onKeyboardShow(event: KeyboardEvent) {
    setKeyboardHeight(event.endCoordinates.height);
  }

  function onKeyboardHide() {
    setKeyboardHeight(0);
  }

  useEffect(() => {
    const onShow = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
    const onHide = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  return keyboardHeight;
};
