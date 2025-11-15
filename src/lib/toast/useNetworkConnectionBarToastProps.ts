import { ToastShowParams } from 'react-native-toast-message';

import { useDevice } from '@react-native-hello/ui';

export const useNetworkConnectionBarToastProps = () => {
  const device = useDevice();
  // Overrides or adds props to lib network connection toast.
  return {
    position: 'bottom',
    autoHide: true,
    visibilityTime: 3000,
    bottomOffset: device.bottomTabBarHeight + 15,
  } as ToastShowParams;
};
