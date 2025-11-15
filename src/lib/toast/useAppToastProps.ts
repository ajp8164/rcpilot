import { ToastShowParams } from 'react-native-toast-message';

import { useDevice } from '@react-native-hello/ui';

export const useAppToastProps = () => {
  const device = useDevice();

  return {
    errorSyncingClubs: {
      type: 'error',
      text1: 'Error Syncing Clubs',
      position: 'bottom',
      autoHide: true,
      visibilityTime: 3000,
      bottomOffset: device.bottomTabBarHeight + 15,
    } as ToastShowParams,
    noNetworkConnection: {
      type: 'networkConnection',
      text1: 'No Internet Connection',
      position: 'bottom',
      autoHide: true,
      visibilityTime: 3000,
      bottomOffset: device.bottomTabBarHeight + 15,
    } as ToastShowParams,
    syncingClubs: {
      type: 'activity',
      text1: 'Syncing Clubs',
      position: 'bottom',
      autoHide: false,
      bottomOffset: device.bottomTabBarHeight + 15,
    } as ToastShowParams,
  };
};
