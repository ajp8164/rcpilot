import { BSON, Object, ObjectSchema } from 'realm';
import { ISODateString, ISODurationString } from 'types/common';

import { EventStyle } from './EventStyle';
import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { ModelType } from 'types/model';

export class Model extends Object<Model> {
  _id!: BSON.ObjectId;
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
  defaultStyle?: EventStyle;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'Model',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
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
    primaryKey: '_id',
  };
};
