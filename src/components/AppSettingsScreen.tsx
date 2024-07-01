import { AppState, Linking, ScrollView, View, useColorScheme } from 'react-native';
import { ListItem, ListItemSwitch } from 'components/atoms/List';
import React, { useEffect, useState } from 'react';
import { saveBiometrics, saveModelsLayout, saveThemeSettings } from 'store/slices/appSettings';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { ModelsLayout } from 'types/preferences';
import { useEvent } from 'lib/event';
import { EnumPickerResult } from 'components/EnumPickerScreen';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'AppSettings'>;

const AppSettings = ({ navigation }: Props) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const dispatch = useDispatch();
  const themeSettings = useSelector(selectThemeSettings);
  const biometrics = useSelector(selectBiometrics);
  const appSettings = useSelector(selectAppSettings);
  const event = useEvent();

  const [biometricsValue, setBiometricsValue] = useState(biometrics);
  const [hasPNPermission, setHasPNPermission] = useState(false);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('models-layout', onChangeModelsLayout);

    return () => {
      event.removeListener('models-layout', onChangeModelsLayout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const onChangeModelsLayout = (result: EnumPickerResult) => {
    dispatch(saveModelsLayout({ presentation: result.value[0] as ModelsLayout }));
  };

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
        <ListItem
          title={'Models Screen Layout'}
          position={['first', 'last']}
          value={appSettings.modelsLayout}
          onPress={() =>
            navigation.navigate('EnumPicker', {
              title: 'Models Layout',
              values: Object.values(ModelsLayout),
              selected: appSettings.modelsLayout,
              eventName: 'models-layout',
            })
          }
        />
      </ScrollView>
    </View>
  );
};

export default AppSettings;
