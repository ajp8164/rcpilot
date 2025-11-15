import Toast from 'react-native-toast-message';

import { useNetwork } from '@react-native-hello/core';
import { useAppToastProps } from 'lib/toast';

export const useEnsureNetwork = () => {
  const network = useNetwork();
  const appToastProps = useAppToastProps();

  const ensureNetwork = <T>(callback: () => T) => {
    // Check for boolean value, ignore while state is undefined.
    if (network.state?.isInternetReachable === true) {
      return callback();
    } else if (network.state?.isInternetReachable === false) {
      Toast.show(appToastProps.noNetworkConnection);
    }
  };

  return {
    ensureNetwork,
    isInternetReachable: network.state?.isInternetReachable,
  };
};
