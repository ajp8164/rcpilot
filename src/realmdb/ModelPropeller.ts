import { BSON, Object, ObjectSchema } from 'realm';

import { MeasurementUnits } from 'types/common';

export class ModelPropeller extends Object<ModelPropeller> {
  _id!: BSON.ObjectId;
  name!: string;
  vendor?: string;
  numberOfBlades?: number;
  diameter?: number;
  pitch?: number;
  measurementUnits!: MeasurementUnits;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'ModelPropeller',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      numberOfBlades: 'int?',
      vendor: 'string?',
      diameter: 'float?',
      pitch: 'float?',
      measurementUnits: 'string',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
};
