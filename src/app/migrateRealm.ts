import Realm from 'realm';
import { log } from '@react-native-ajp-elements/core';

export const migrateRealm = (oldRealm: Realm, newRealm: Realm) => {
  log.info(`Realm migration from v${oldRealm.schemaVersion} to v${newRealm.schemaVersion}`);
  return;
};
