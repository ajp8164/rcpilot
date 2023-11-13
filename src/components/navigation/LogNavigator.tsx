import { LogNavigatorParamList } from 'types/navigation';
import LogScreen from 'components/LogScreen';
import React from 'react';
import { SvgXml } from 'react-native-svg';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getSvg } from '@react-native-ajp-elements/ui';
import { useTheme } from 'theme';

const LogStack = createNativeStackNavigator<LogNavigatorParamList>();

const LogNavigator = () => {
  const theme = useTheme();

  return (
    <LogStack.Navigator
      initialRouteName="Log"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: {
          color: theme.colors.screenHeaderText,
        },
        headerTintColor: theme.colors.screenHeaderBackButton,
      }}>
      <LogStack.Screen
        name="Log"
        component={LogScreen}
        options={{
          headerShadowVisible: false,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerTitle: () => (
            <SvgXml
              width={45}
              height={45}
              style={{ top: -5 }}
              xml={getSvg('brandIcon')}
            />
          ),
        }}
      />
    </LogStack.Navigator>
  );
};

export default LogNavigator;
