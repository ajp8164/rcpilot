import { log } from '@react-native-hello/core';
import Realm from 'realm';

export const migrateRealm = (oldRealm: Realm, newRealm: Realm) => {
  log.info(
    `Realm migration from v${oldRealm.schemaVersion} to v${newRealm.schemaVersion}`,
  );
  return;
};
