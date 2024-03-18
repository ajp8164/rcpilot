import { BSON, Object, ObjectSchema } from 'realm';

import { Filter } from './Filter';

export class EventsMaintenanceReport extends Object<EventsMaintenanceReport> {
  _id!: BSON.ObjectId;
  name!: string;
  ordinal!: number;
  includesSummary!: boolean;
  includesEvents!: boolean;
  includesMaintenance!: boolean;
  eventsFilter?: Filter;
  maintenanceFilter?: Filter;

  static schema: ObjectSchema = {
    name: 'EventsMaintenanceReport',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      ordinal: 'int',
      includesSummary: 'bool',
      includesEvents: 'bool',
      includesMaintenance: 'bool',
      eventsFilter: 'Filter?',
      maintenanceFilter: 'Filter?',
    },
    primaryKey: '_id',
  };
}
