import { AuthContext, useAuthContext } from 'lib/auth';
import { CameraContext, CameraModal, ColorModeSwitch, useCameraContext } from '@react-native-ajp-elements/ui';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { InitStatus, initApp } from 'app';
import { MainNavigatorParamList, StartupScreen } from 'types/navigation';
import { NetworkContext, useNetworkContext } from 'lib/network';
import { useEffect, useRef, useState } from 'react';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { AppError } from 'lib/errors';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import ErrorBoundary from 'react-native-error-boundary';
import {EventProvider} from 'lib/event';
import { LinkingOptions } from '@react-navigation/native';
import MainNavigator from 'components/navigation/MainNavigator';
import NetworkConnectionBar from 'components/atoms/NetworkConnnectionBar';
import RNBootSplash from 'react-native-bootsplash';
import { SignInModal } from 'components/modals/SignInModal';
import { StatusBar } from 'react-native';
import { log } from '@react-native-ajp-elements/core';
import { selectThemeSettings } from 'store/selectors/appSettingsSelectors';
import { useAchievementConveyor } from 'lib/achievement';
import { useChecklistActionScheduleUpdater } from 'lib/useChecklistActionScheduleUpdater';
import { useColorScheme } from 'react-native';
import { useDeviceShake } from 'lib/useDeviceShake';
import { useSelector } from 'react-redux';
import { useUnknownPilot } from 'lib/pilot';

// See https://reactnavigation.org/docs/configuring-links
const linking: LinkingOptions<MainNavigatorParamList> = {
  prefixes: ['rcpilot://', 'https://rcpilot.app'],
  config: {
    screens: {},
  },
};

const AppMain = () => {
  const themeSettings = useSelector(selectThemeSettings);
  const scheme = useColorScheme();

  const cameraModalRef = useRef<CameraModal>(null);
  const signInModalRef = useRef<SignInModal>(null);
  const auth = useAuthContext(signInModalRef);
  const camera = useCameraContext(cameraModalRef);
  const network = useNetworkContext();
  useDeviceShake();
  useAchievementConveyor();
  useChecklistActionScheduleUpdater();
  useUnknownPilot();

  const [startupScreen, setStartupScreen] = useState<StartupScreen>(
    StartupScreen.None,
  );
  const [fatal, setFatal] = useState<string | undefined>(undefined);

  useEffect(() => {
    const hideSplashScreen = () => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          RNBootSplash.hide({ fade: true });
          StatusBar.setHidden(false);
          resolve();
        }, 200);
      });
    };

    (async () => {
      try {
        // Main application initialization.
        const status = await initApp();
        log.info(`Initialization status: ${status}`);

        switch (status) {
          case InitStatus.Success:
          case InitStatus.NotAuthorized:
            // The destination should handle condition NotAuthorized.
            setStartupScreen(StartupScreen.Home);
            break;
          case InitStatus.NotVerified:
          default:
            setStartupScreen(StartupScreen.Welcome);
        }

        hideSplashScreen();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        log.error(e.message);
        // Expose any initialization error.
        setFatal(e.message);
        hideSplashScreen();
      }
    })();
  }, []);

  if (fatal) {
    throw new AppError(fatal);
  }

  const onError = (error: Error, stack: string) => {
    log.fatal(`Unhandled app error: ${error.message}\n${stack}`);
  };

  return (
    <NavigationContainer
      linking={linking}
      // Removes default background (white) flash on tab change when in dark mode.
      theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ActionSheetProvider>
        <BottomSheetModalProvider>
          <ColorModeSwitch themeSettings={themeSettings}>
            <ErrorBoundary onError={onError}>
              <NetworkContext.Provider value={network}>
                <NetworkConnectionBar />
                <AuthContext.Provider value={auth}>
                  <CameraContext.Provider value={camera}>
                    <EventProvider>
                      <MainNavigator startupScreen={startupScreen} />
                      <SignInModal ref={signInModalRef} />
                      <CameraModal ref={cameraModalRef} />
                    </EventProvider>
                  </CameraContext.Provider>
                </AuthContext.Provider>
              </NetworkContext.Provider>
            </ErrorBoundary>
          </ColorModeSwitch>
        </BottomSheetModalProvider>
      </ActionSheetProvider>
    </NavigationContainer>
  );
};

export default AppMain;
