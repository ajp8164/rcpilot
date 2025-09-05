import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  BatteryFull,
  FileText,
  Plane,
  ScanLine,
  Settings,
} from 'lucide-react-native';
import { TabNavigatorParamList } from 'types/navigation';

import BatteriesNavigator from './BatteriesNavigator';
import ClubsNavigator from './ClubsNavigator';
import LogNavigator from './LogNavigator';
import ModelsNavigator from './ModelsNavigator';
import ScanNavigator from './ScanNavigator';
import SetupNavigator from './SetupNavigator';

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
        tabBarItemStyle: { top: 10 },
      }}>
      <Tab.Screen
        name="LogTab"
        component={LogNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <FileText color={color} size={33} />,
        }}
      />
      <Tab.Screen
        name="ClubsTab"
        component={ClubsNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <FileText color={color} size={33} />,
        }}
      />
      <Tab.Screen
        name="ModelsTab"
        component={ModelsNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <Plane color={color} size={33} />,
        }}
      />
      <Tab.Screen
        name="BatteriesTab"
        component={BatteriesNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <BatteryFull color={color} size={33} />,
        }}
      />
      <Tab.Screen
        name="SetupTab"
        component={SetupNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <Settings color={color} size={33} />,
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <ScanLine color={color} size={33} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
