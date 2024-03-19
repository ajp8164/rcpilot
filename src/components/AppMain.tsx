import { AuthContext, useAuthContext } from 'lib/auth';
import {
  CameraContext,
  CameraModal,
  ColorModeSwitch,
  useCameraContext,
} from '@react-native-ajp-elements/ui';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { DatabaseInfoContext, useDatabaseInfo } from 'lib/database';
import { InitStatus, useInitApp } from 'app';
import { MainNavigatorParamList, StartupScreen } from 'types/navigation';
import { NetworkContext, useNetworkContext } from 'lib/network';
import { useEffect, useRef, useState } from 'react';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { AppError } from 'lib/errors';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import ErrorBoundary from 'react-native-error-boundary';
import { EventProvider } from 'lib/event';
import { GeoPositionContext } from 'lib/location';
import { LinkingOptions } from '@react-navigation/native';
import MainNavigator from 'components/navigation/MainNavigator';
import NetworkConnectionBar from 'components/atoms/NetworkConnnectionBar';
import RNBootSplash from 'react-native-bootsplash';
import React from 'react-native';
import { SignInModal } from 'components/modals/SignInModal';
import { StatusBar } from 'react-native';
import { log } from '@react-native-ajp-elements/core';
import { selectThemeSettings } from 'store/selectors/appSettingsSelectors';
import { useColorScheme } from 'react-native';
import { useCurrentLocation } from 'lib/location';
import { useSelector } from 'react-redux';

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
  const databaseInfo = useDatabaseInfo();
  const currentPosition = useCurrentLocation();
  const initApp = useInitApp();

  const [startupScreen, setStartupScreen] = useState<StartupScreen>(StartupScreen.None);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                      <DatabaseInfoContext.Provider value={databaseInfo}>
                        <GeoPositionContext.Provider value={currentPosition}>
                          <MainNavigator startupScreen={startupScreen} />
                        </GeoPositionContext.Provider>
                      </DatabaseInfoContext.Provider>
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
