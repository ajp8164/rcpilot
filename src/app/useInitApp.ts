import '@react-native-firebase/app';

import { AJPElements, log } from '@react-native-ajp-elements/core';
import { ReactNativeHello } from '@react-native-hello/core';
import { useTheme } from 'theme';

import { AppError } from 'lib/errors';
import { BackHandler } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appConfig } from 'config';
// import firestore from '@react-native-firebase/firestore';
import { initPushNotifications } from 'lib/notifications';
// import storage from '@react-native-firebase/storage';
import { svgImages } from 'theme';
import { useAchievementConveyor } from 'lib/achievement';
import { useChecklistActionScheduleUpdater } from 'lib/useChecklistActionScheduleUpdater';
import { useDeviceShake } from 'lib/useDeviceShake';
import { useUnknownPilot } from 'lib/pilot';

export enum InitStatus {
  NotAuthorized = 'NotAuthorized',
  NotVerified = 'NotVerified',
  Success = 'Success',
}

export const useInitApp = () => {
  const theme = useTheme();
  useDeviceShake();

  // Order is important here.
  useUnknownPilot();
  useAchievementConveyor();
  useChecklistActionScheduleUpdater();

  return async (): Promise<InitStatus> => {
    try {
      // Initialize firestore for dev as necessary.
      if (__DEV__) {
        // firestore().useEmulator('10.6.9.64', 8080);
        // storage().useEmulator('10.6.9.64', 9199);
        // console.log('Firestore emulator running at 10.6.9.100:8080');
        // firestore().clearPersistence();
      }

      // Disable Android hardware back button.
      BackHandler.addEventListener('hardwareBackPress', () => {
        return true;
      });

      initPushNotifications();

      AJPElements.init({
        buildEnvironment: appConfig.buildEnvironment,
        sentryEndpoint: appConfig.sentryEndpoint,
        sentryLoggingEnabled: appConfig.sentryLoggingEnabled,
        svgImages,
        // userId: '',
      });

      ReactNativeHello.init({
        buildEnvironment: appConfig.buildEnvironment,
        sentryEndpoint: appConfig.sentryEndpoint,
        sentryLoggingEnabled: appConfig.sentryLoggingEnabled,
        svgImages,
        theme,
        // userId: '',
      });

      GoogleSignin.configure({
        webClientId: appConfig.firebaseOauthClientId,
      });

      return InitStatus.Success;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      log.error(`App initialization: ${e.message}`);
      throw new AppError(e.message);
    }
  };
};
