import { AppState, Linking, ScrollView, View, useColorScheme } from 'react-native';
import { ListItem, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { saveBiometrics, saveShowModelCards, saveThemeSettings } from 'store/slices/appSettings';
import {
  selectAppSettings,
  selectBiometrics,
  selectThemeSettings,
} from 'store/selectors/appSettingsSelectors';
import { useDispatch, useSelector } from 'react-redux';

import { Divider } from '@react-native-ajp-elements/ui';
import { biometricAuthentication } from 'lib/biometricAuthentication';
import { hasPushNotificationsPermission } from 'lib/notifications';
import { useTheme } from 'theme';

const AppSettings = () => {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const dispatch = useDispatch();
  const themeSettings = useSelector(selectThemeSettings);
  const biometrics = useSelector(selectBiometrics);
  const appSettings = useSelector(selectAppSettings);

  const [biometricsValue, setBiometricsValue] = useState(biometrics);
  const [hasPNPermission, setHasPNPermission] = useState(false);

  useEffect(() => {
    hasPushNotificationsPermission().then(permission => {
      setHasPNPermission(permission);
    });

    const listener = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        hasPushNotificationsPermission().then(permission => {
          setHasPNPermission(permission);
        });
      }
    });

    return () => {
      listener.remove();
    };
  }, []);

  const toggleAppearance = (value: boolean) => {
    dispatch(
      saveThemeSettings({
        themeSettings: { ...themeSettings, app: value ? 'dark' : 'light' },
      }),
    );
    theme.updateTheme({ mode: value ? 'dark' : 'light' });
  };

  const toggleBiometrics = async (value: boolean) => {
    setBiometricsValue(value);
    if (value === false) {
      // Require biometrics to turn off feature.
      await biometricAuthentication()
        .then(() => {
          dispatch(saveBiometrics({ value }));
        })
        .catch(() => {
          setBiometricsValue(true);
        });
    } else {
      dispatch(saveBiometrics({ value }));
    }
  };

  const toggleUseDevice = (value: boolean) => {
    dispatch(
      saveThemeSettings({
        themeSettings: { ...themeSettings, followDevice: value },
      }),
    );
    const control = value ? colorScheme : themeSettings.app;
    theme.updateTheme({ mode: control === 'dark' ? 'dark' : 'light' });
  };

  const toggleShowModelCards = (value: boolean) => {
    dispatch(saveShowModelCards({ value }));
  };

  return (
    <View style={theme.styles.view}>
      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'NOTIFICATIONS'} />
        <ListItem
          title={'Push Notifications'}
          value={hasPNPermission ? 'On' : 'Off'}
          position={['first', 'last']}
          onPress={Linking.openSettings}
        />
        <Divider text={'SECURITY'} />
        <ListItemSwitch
          title={'Use Biometrics ID'}
          value={biometricsValue}
          position={['first', 'last']}
          onValueChange={toggleBiometrics}
        />
        <Divider
          note
          text={
            'Biometrics enable face recognition or fingerprint. When enabled biometrics protects changes to your information.'
          }
        />
        <Divider text={'APPEARANCE'} />
        <ListItemSwitch
          title={'Dark Appearance'}
          value={themeSettings.app === 'dark'}
          disabled={themeSettings.followDevice}
          position={['first']}
          onValueChange={toggleAppearance}
        />
        <ListItemSwitch
          title={'Use Device Setting'}
          value={themeSettings.followDevice}
          position={['last']}
          onValueChange={toggleUseDevice}
        />
        <Divider text={'VIEW OPTIONS'} />
        <ListItemSwitch
          title={'Show Models As Cards'}
          subtitle={'Show model cards on the Models tab'}
          value={appSettings.showModelCards}
          position={['first', 'last']}
          onValueChange={toggleShowModelCards}
        />
      </ScrollView>
    </View>
  );
};

export default AppSettings;
