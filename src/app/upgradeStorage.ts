import { log } from '@react-native-hello/core';
import { appConfig } from 'config';
import { AppError } from 'lib/errors';
import { dispatch, store } from 'store';
import { StoreState } from 'store/initialStoreState';
import { saveSchemaVersion } from 'store/slices/app';

export const upgradeStorage = (): void => {
  const state: StoreState = store.getState();
  const fromVersion = state.app.storageSchemaVersion;
  const toVersion = appConfig.storageSchemaVersion;

  if (toVersion === 0) {
    throw new AppError('App config error, no storage schema specified');
  }

  // Run upgraders in order.
  for (let i = fromVersion; i < toVersion; i++) {
    upgraders[i]();
  }
};

const upgradeTo1 = (): void => {
  dispatch(saveSchemaVersion({ version: 1 }));
  log.info(`Storage schema v1 check ok`);
};

const upgraders = [upgradeTo1];
