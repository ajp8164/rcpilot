import BatteryPerformanceFiltersScreen from 'components/BatteryPerformanceFiltersScreen';
import { BatteryPerformanceNavigatorParamList } from 'types/navigation';
import NavContext from './NavContext';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'theme';

const BatteryPerformanceStack = createNativeStackNavigator<BatteryPerformanceNavigatorParamList>();

const BatteryPerformanceNavigator = () => {
  const theme = useTheme();

  return (
    <NavContext.Provider value={{isModal: true}}>
      <BatteryPerformanceStack.Navigator
      initialRouteName='BatteryPerformanceFilters'
      screenOptions={{
        headerLargeTitleShadowVisible: theme.mode === 'light',
        headerLargeStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: {
          color: theme.colors.screenHeaderText,
        },
        headerTintColor: theme.colors.screenHeaderBackButton,
      }}>
        <BatteryPerformanceStack.Screen
          name='BatteryPerformanceFilters'
          component={BatteryPerformanceFiltersScreen}
          options={{
            title: 'Filters for Event Cycles',
          }}
        />
      </BatteryPerformanceStack.Navigator>
    </NavContext.Provider>
  );
};

export default BatteryPerformanceNavigator;
