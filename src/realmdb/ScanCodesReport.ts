import { BSON, Object, ObjectSchema } from 'realm';

import { Filter } from './Filter';

export class ScanCodesReport extends Object<ScanCodesReport> {
  _id!: BSON.ObjectId;
  name!: string;
  ordinal!: number;
  includesModels!: boolean;
  includesBatteries!: boolean;
  modelScanCodesFilter?: Filter;
  batteryScanCodesFilter?: Filter;

  static schema: ObjectSchema = {
    name: 'ScanCodesReport',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      ordinal: 'int',
      includesModels: 'bool?',
      includesBatteries: 'bool?',
      modelScanCodesFilter: 'Filter?',
      batteryScanCodesFilter: 'Filter?',
    },
    primaryKey: '_id',
  };
}
