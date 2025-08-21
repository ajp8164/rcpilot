import { useEffect, useRef } from 'react';
import fs from 'react-native-fs';

import { useRealm } from '@realm/react';
import { appConfig } from 'config';
import { DatabaseInfoContext } from 'lib/database';
import { DateTime } from 'luxon';
import {
  Battery,
  BatteryCycle,
  ChecklistTemplate,
  Event,
  EventStyle,
  EventsMaintenanceReport,
  Filter,
  Location,
  Model,
  ModelCategory,
  ModelFuel,
  ModelPropeller,
  Pilot,
  ScanCodesReport,
} from 'realmdb';

export const useDatabaseInfo = (): DatabaseInfoContext => {
  const realm = useRealm();
  const databaseLastUpdate = useRef('');
  const databaseObjects = useRef(0);
  const databaseSize = useRef(0);

  useEffect(() => {
    realm.addListener('change', onRealmChange);
    return () => {
      realm.removeListener('change', onRealmChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRealmChange = () => {
    if (realm.isClosed) return;
    databaseLastUpdate.current = DateTime.now().toISO();

    (async () => {
      let objectCount = 0;
      objectCount += realm.objects(Battery).length;
      objectCount += realm.objects(BatteryCycle).length;
      objectCount += realm.objects(ChecklistTemplate).length;
      objectCount += realm.objects(Event).length;
      objectCount += realm.objects(EventsMaintenanceReport).length;
      objectCount += realm.objects(EventStyle).length;
      objectCount += realm.objects(Filter).length;
      objectCount += realm.objects(Location).length;
      objectCount += realm.objects(ModelCategory).length;
      objectCount += realm.objects(ModelFuel).length;
      objectCount += realm.objects(ModelPropeller).length;
      objectCount += realm.objects(Model).length;
      objectCount += realm.objects(Pilot).length;
      objectCount += realm.objects(ScanCodesReport).length;
      databaseObjects.current = objectCount;

      setTimeout(async () => {
        if (realm.isClosed) return;
        const result = await fs.stat(realm.path).catch(() => null);
        if (result) {
          databaseSize.current = result.size;
        }
      });
    })();
  };

  return {
    info: {
      databaseLastUpdate: databaseLastUpdate.current,
      databaseObjects: databaseObjects.current,
      databaseSize: databaseSize.current,
      databaseVersion: realm.schemaVersion,
      databaseVersionDate: appConfig.databaseDate,
    },
  };
};
