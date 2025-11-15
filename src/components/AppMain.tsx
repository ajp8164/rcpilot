import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import ErrorBoundary from 'react-native-error-boundary';
import Toast from 'react-native-toast-message';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  EventProvider,
  NetworkContext,
  log,
  useNetwork,
} from '@react-native-hello/core';
import {
  CameraProvider,
  NetworkConnectionBar,
  ThemeManager,
} from '@react-native-hello/ui';
import {
  DarkTheme,
  DefaultTheme,
  LinkingOptions,
  NavigationContainer,
} from '@react-navigation/native';
import { DataSyncProvider, InitStatus, useInitApp } from 'app';
import { BackdropProvider } from 'components/atoms/Backdrop';
import { ColorModeSwitch } from 'components/atoms/ColorModeSwitch';
import { ColorPickerProvider } from 'components/modals/ColorPickerModal';
import MainNavigator from 'components/navigation/MainNavigator';
import { AuthProvider } from 'lib/auth/AuthProvider';
import { DatabaseInfoProvider } from 'lib/database';
import { AppError } from 'lib/errors';
import { GeoPositionProvider } from 'lib/location';
import {
  useAppToastConfig,
  useNetworkConnectionBarToastProps,
} from 'lib/toast';
import { MainNavigatorParamList, StartupScreen } from 'types/navigation';

// See https://reactnavigation.org/docs/configuring-links
const linking: LinkingOptions<MainNavigatorParamList> = {
  prefixes: ['rccommander://', 'https://rccommander.app'],
  config: {
    screens: {},
  },
};

const AppMain = () => {
  const themeName = ThemeManager.name;
  const initApp = useInitApp();
  const appToastConfig = useAppToastConfig();
  const networkConnectionBarToastProps = useNetworkConnectionBarToastProps();
  const network = useNetwork();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fatal) {
    throw new AppError(fatal);
  }

  const onError = (error: Error, stack: string) => {
    log.fatal(`Unhandled app error: ${error.message}\n${stack}`);
  };

  if (startupScreen === StartupScreen.None) {
    return null;
  }

  return (
    <>
      <NavigationContainer
        linking={linking}
        // Removes default background (white) flash on tab change when in dark mode.
        theme={themeName === 'dark' ? DarkTheme : DefaultTheme}>
        <ColorModeSwitch>
          <DataSyncProvider>
            <ActionSheetProvider>
              <BottomSheetModalProvider>
                <ErrorBoundary onError={onError}>
                  <NetworkContext.Provider value={network}>
                    <NetworkConnectionBar
                      toastProps={networkConnectionBarToastProps}
                    />
                    <AuthProvider>
                      <CameraProvider>
                        <EventProvider>
                          <DatabaseInfoProvider>
                            <GeoPositionProvider>
                              <ColorPickerProvider>
                                <BackdropProvider>
                                  <MainNavigator
                                    startupScreen={startupScreen}
                                  />
                                </BackdropProvider>
                              </ColorPickerProvider>
                            </GeoPositionProvider>
                          </DatabaseInfoProvider>
                        </EventProvider>
                      </CameraProvider>
                    </AuthProvider>
                  </NetworkContext.Provider>
                </ErrorBoundary>
              </BottomSheetModalProvider>
            </ActionSheetProvider>
          </DataSyncProvider>
        </ColorModeSwitch>
      </NavigationContainer>
      <Toast config={{ ...appToastConfig }} />
    </>
  );
};

export default AppMain;
