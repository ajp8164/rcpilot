import { BSON, Object, ObjectSchema } from 'realm';
import { ISODateString, MeasurementUnits } from 'types/common';

export class ModelPropeller extends Object<ModelPropeller> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
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
      createdOn: 'string',
      updatedOn: 'string',
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
