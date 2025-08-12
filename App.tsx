import { RealmProvider } from '@realm/react';
import { ThemeProvider } from '@rn-vui/themed';
import AppMain from 'components/AppMain';
import { appConfig } from 'config';
import React from 'react';
import { LogBox } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import Realm from 'realm';
import Schema from 'realmdb/Schema';
import { PersistGate } from 'redux-persist/integration/react';
// Must be at top, see https://reactnavigation.org/docs/en/getting-started.html

import { persistor, store } from 'store';
// import { migrateRealm } from 'app';
import { theme } from 'theme';

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
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <ReduxProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <RealmProvider
                schema={Schema}
                schemaVersion={parseInt(appConfig.databaseVersion, 10)}
                // onMigration={migrateRealm}
                deleteRealmIfMigrationNeeded={true}>
                <AppMain />
              </RealmProvider>
            </PersistGate>
          </ReduxProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default App;
