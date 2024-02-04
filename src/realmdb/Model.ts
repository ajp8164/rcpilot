import { BSON, Object, ObjectSchema } from 'realm';
import { ISODateString, ScanCodeSize } from 'types/common';

import { EventStyle } from './EventStyle';
import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { ModelType } from 'types/model';

export class Model extends Object<Model> {
  _id!: BSON.ObjectId;
  name!: string;
  image?: string;
  type!: ModelType;
  vendor?: string;
  category?: ModelCategory;
  purchasePrice?: number;
  retired!: boolean;
  damaged!: boolean;
  totalEvents?: number;
  totalTime?: number;
  lastEvent?: ISODateString;
  logsBatteries!: boolean;
  logsFuel!: boolean;
  fuelCapacity?: number;
  totalFuel?: number;
  defaultFuel?: ModelFuel;
  defaultPropeller?: ModelPropeller;
  defaultStyle?: EventStyle;
  scanCodeSize?: ScanCodeSize;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'Model',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      image: 'string?',
      type: { type: 'string', default: ModelType.Airplane },
      vendor: 'string?',
      category: 'ModelCategory?',
      purchasePrice: 'float?',
      retired: { type: 'bool', default: false },
      damaged: { type: 'bool', default: false },
      totalEvents: 'int?',
      totalTime: 'int?',
      lastEvent: 'string?',
      logsBatteries: { type: 'bool', default: false },
      logsFuel: { type: 'bool', default: false },
      fuelCapacity: 'float?',
      totalFuel: 'float?',
      defaultFuel: 'ModelFuel?',
      defaultPropeller: 'ModelPropeller?',
      defaultStyle: 'EventStyle?',
      scanCodeSize: 'string?',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
};
