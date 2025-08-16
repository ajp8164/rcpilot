import BatteriesNavigator from './BatteriesNavigator';
import LogNavigator from './LogNavigator';
import ModelsNavigator from './ModelsNavigator';
import ScanNavigator from './ScanNavigator';
import SetupNavigator from './SetupNavigator';
import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  BatteryFull,
  FileText,
  Plane,
  ScanLine,
  Settings,
} from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { TabNavigatorParamList } from 'types/navigation';

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

const TabNavigator = () => {
  const theme = useTheme();

  useEffect(() => {
    StatusBar.setBarStyle(
      ThemeManager.name === 'light' ? 'dark-content' : 'light-content',
    );

    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.white);
      SystemNavigationBar.setNavigationColor(
        theme.colors.hintGray,
        ThemeManager.name === 'light' ? 'dark' : 'light',
        'navigation',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ThemeManager.name]);

  return (
    <Tab.Navigator
      initialRouteName="LogTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabBarActiveTint,
        tabBarInactiveTintColor: theme.colors.tabBarInactiveTint,
        tabBarActiveBackgroundColor: theme.colors.tabBarBackgroundActive,
        tabBarInactiveBackgroundColor: theme.colors.tabBarBackgroundInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackgroundInactive,
          borderTopColor: theme.colors.tabBarBorder,
        },
        tabBarItemStyle: { top: 3 },
        tabBarLabelStyle: { top: 3 },
      }}>
      <Tab.Screen
        name="LogTab"
        component={LogNavigator}
        options={{
          tabBarLabel: 'Log',
          tabBarIcon: ({ color }) => <FileText color={color} size={33} />,
        }}
      />
      <Tab.Screen
        name="ModelsTab"
        component={ModelsNavigator}
        options={{
          tabBarLabel: 'Models',
          tabBarIcon: ({ color }) => <Plane color={color} size={33} />,
        }}
      />
      <Tab.Screen
        name="BatteriesTab"
        component={BatteriesNavigator}
        options={{
          tabBarLabel: 'Batteries',
          tabBarIcon: ({ color }) => <BatteryFull color={color} size={33} />,
        }}
      />
      <Tab.Screen
        name="SetupTab"
        component={SetupNavigator}
        options={{
          tabBarLabel: 'Setup',
          tabBarIcon: ({ color }) => <Settings color={color} size={33} />,
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanNavigator}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color }) => <ScanLine color={color} size={33} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
