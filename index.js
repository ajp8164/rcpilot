// import './wdyr';
import 'react-native-gesture-handler';
import './shim.js';
import 'react-native-get-random-values'; // Polyfill for realm

import App from './App';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
