import { NetworkContext } from 'lib/network';
import { useContext, useEffect } from 'react';
import Toast from 'react-native-toast-message';

const NetworkConnectionBar = () => {
  const network = useContext(NetworkContext);

  useEffect(() => {
    if (!network.state?.isConnected) {
      showToast();
    }
  }, [network.state?.isConnected]);

  const showToast = () => {
    Toast.show({
      type: 'info',
      position: 'top',
      autoHide: true,
      visibilityTime: 5000,
      text1: 'No internet connection',
    });
  };

  return null;
};

export default NetworkConnectionBar;
