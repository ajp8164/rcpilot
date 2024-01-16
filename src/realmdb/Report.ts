import { BSON, Object, ObjectSchema } from 'realm';

import { ReportType } from 'types/database';

export class Report extends Object<Report> {
  _id!: BSON.ObjectId;
  name!: string;
  type!: ReportType;
  ordinal!: number;

  static schema: ObjectSchema = {
    name: 'Report',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      ordinal: 'float',
    },
    primaryKey: '_id',
  };
};