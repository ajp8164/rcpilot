import { BSON, Object, ObjectSchema } from 'realm';
import { ISODateString, ScanCodeSize } from 'types/common';

import { Battery } from './Battery';
import { Checklist } from 'realmdb/Checklist';
import { Event } from './Event';
import { EventStyle } from './EventStyle';
import { ModelCategory } from './ModelCategory';
import { ModelFuel } from './ModelFuel';
import { ModelPropeller } from './ModelPropeller';
import { ModelType } from 'types/model';

export class Model extends Object<Model> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  name!: string;
  image?: string;
  type!: ModelType;
  vendor?: string;
  category?: ModelCategory;
  checklists: Checklist[] = [];
  purchasePrice?: number;
  retired!: boolean;
  damaged!: boolean;
  requiresMaintenance!: boolean;
  lastEvent?: ISODateString;
  events: Event[] = [];
  logsBatteries!: boolean;
  favoriteBatteries: Battery[] = [];
  logsFuel!: boolean;
  fuelCapacity?: number;
  totalFuel?: number;
  defaultFuel?: ModelFuel;
  defaultPropeller?: ModelPropeller;
  defaultStyle?: EventStyle;
  scanCodeSize?: ScanCodeSize;
  notes?: string;
  statistics!: ModelStatistics;

  static schema: ObjectSchema = {
    name: 'Model',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      name: 'string',
      image: 'string?',
      type: { type: 'string', default: ModelType.Airplane },
      vendor: {type: 'string', optional: true, indexed: 'full-text'},
      category: 'ModelCategory?',
      checklists: { type: 'list', objectType: 'Checklist', default: [] },
      purchasePrice: 'float?',
      retired: { type: 'bool', default: false },
      damaged: { type: 'bool', default: false },
      requiresMaintenance: { type: 'bool', default: false },
      lastEvent: 'string?',
      events: { type: 'list', objectType: 'Event', default: [] },
      logsBatteries: { type: 'bool', default: false },
      favoriteBatteries: { type: 'list', objectType: 'Battery', default: [] },
      logsFuel: { type: 'bool', default: false },
      fuelCapacity: 'float?',
      totalFuel: 'float?',
      defaultFuel: 'ModelFuel?',
      defaultPropeller: 'ModelPropeller?',
      defaultStyle: 'EventStyle?',
      scanCodeSize: 'string?',
      notes: {type: 'string', optional: true, indexed: 'full-text'},
      statistics: 'ModelStatistics',
    },
    primaryKey: '_id',
  };
};

export class ModelStatistics extends Object<ModelStatistics> {
  crashCount!: number;
  eventStyleData!: ModelEventStyleData[];
  perEventCost!: number;
  totalEvents!: number;
  totalMaintenanceCost!: number;
  totalTime!: number;
  uncertainCost!: boolean;

  static schema: ObjectSchema = {
    name: 'ModelStatistics',
    embedded: true,
    properties: {
      crashCount: 'int',
      eventStyleData: 'ModelEventStyleData[]',
      perEventCost: 'float',
      totalEvents: 'int',
      totalMaintenanceCost: 'float',
      totalTime: 'int',
      uncertainCost: 'bool',
    },
  };
};

export class ModelEventStyleData extends Object<ModelEventStyleData> {
  eventStyleId!: string;
  eventStyleCount!: number;
  eventStyleDuration!: number;

  static schema: ObjectSchema = {
    name: 'ModelEventStyleData',
    embedded: true,
    properties: {
      eventStyleId: 'string',
      eventStyleCount: 'int',
      eventStyleDuration: 'int',
    },
  };
};
