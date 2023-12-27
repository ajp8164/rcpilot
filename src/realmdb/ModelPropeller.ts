import Realm, { BSON, ObjectSchema } from 'realm';

import { MeasurementUnits } from 'types/common';

export class ModelPropeller extends Realm.Object<ModelPropeller> {
  id!: BSON.ObjectId;
  name!: string;
  vendor?: string;
  numberOfBlades?: number;
  diameter?: number;
  pitch?: number;
  measuredUnits!: MeasurementUnits;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'ModelPropeller',
    properties: {
      id: 'objectId',
      name: 'string',
      numberOfBlades: 'int',
      vendor: 'string',
      diameter: 'float',
      pitch: 'float',
      measuredUnits: 'string',
      notes: 'string',
    },
    primaryKey: 'id',
  };
};
