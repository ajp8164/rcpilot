import { AppRegistry } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-get-random-values';

// Polyfill for realm

import App from './App';
import { name as appName } from './app.json';

// import './wdyr';

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

AppRegistry.registerComponent(appName, () => App);
