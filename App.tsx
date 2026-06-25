import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { ThemeProvider } from '@react-native-hello/ui';
import { RealmProvider } from '@realm/react';
import AppMain from 'components/AppMain';
import { appConfig } from 'config';
import Realm from 'realm';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Schema from 'realmdb/Schema';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from 'store';

import 'react-native-gesture-handler';
import 'theme'; // Update the ThemeManager with our local themes.

if (__DEV__) {
  console.log(`Realm: ${Realm.defaultPath}`);
}

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  "The provided value 'moz",
  "The provided value 'ms-stream",
]);

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ReduxProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <RealmProvider
                schema={Schema}
                schemaVersion={parseInt(appConfig.databaseVersion, 10)}
                // onMigration={migrateRealm}
                deleteRealmIfMigrationNeeded={true}>
                <KeyboardProvider>
                  <AppMain />
                </KeyboardProvider>
              </RealmProvider>
            </PersistGate>
          </ReduxProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
