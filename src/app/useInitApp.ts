import '@react-native-firebase/app';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { log } from '@react-native-hello/core';
import { ReactNativeHello } from '@react-native-hello/core';
import { appConfig } from 'config';
import { useAchievementConveyor } from 'lib/achievement';
import { AppError } from 'lib/errors';
// import firestore from '@react-native-firebase/firestore';
import { initPushNotifications } from 'lib/notifications';
import { useUnknownPilot } from 'lib/pilot';
import { useChecklistActionScheduleUpdater } from 'lib/useChecklistActionScheduleUpdater';
import { useDeviceShake } from 'lib/useDeviceShake';
import { BackHandler } from 'react-native';
import { useTheme } from 'theme';
// import storage from '@react-native-firebase/storage';
import { svgImages } from 'theme';

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
