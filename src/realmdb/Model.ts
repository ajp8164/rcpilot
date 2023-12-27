import { ISODateString, ISODurationString } from 'types/common';
import Realm, { BSON, ObjectSchema } from 'realm';

import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { ModelStyle } from './ModelStyle';
import { ModelType } from 'types/model';

export class Model extends Realm.Object<Model> {
  id!: BSON.ObjectId;
  name!: string;
  image!: string;
  type!: string;
  vendor?: string;
  category?: ModelCategory;
  purchasePrice?: number;
  retired!: boolean;
  damaged!: boolean;
  totalEvents?: number;
  totalTime?: ISODurationString;
  lastEvent?: ISODateString;
  logsBatteries!: boolean;
  logsFuel!: boolean;
  fuelCapacity?: number;
  totalFuel?: number;
  defaultFuel?: ModelFuel;
  defaultPropeller?: ModelPropeller;
  defaultStyle?: ModelStyle;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'Model',
    properties: {
      id: 'objectId',
      name: 'string',
      image: 'string',
      type: { type: 'string', default: ModelType.Airplane },
      vendor: 'string',
      categoryId: 'string',
      purchasePrice: 'float',
      retired: { type: 'bool', default: false },
      damaged: { type: 'bool', default: false },
      totalEvents: 'int',
      totalTime: 'string',
      lastEvent: 'string',
      logsBatteries: { type: 'bool', default: false },
      logsFuel: { type: 'bool', default: false },
      fuelCapacity: 'float',
      totalFuel: 'float',
      defaultFuelId: 'string',
      defaultPropellerId: 'string',
      defaultStyleId: 'string',
      notes: 'string',
    },
    primaryKey: 'id',
  };
};
