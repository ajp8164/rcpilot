import { BSON, Object, ObjectSchema } from 'realm';
import {
  BatteryFilterValues,
  BatteryScanCodeReportFilterValues,
  EventReportFilterValues,
  FilterType,
  MaintenanceReportFilterValues,
  ModelFilterValues,
  ModelScanCodeReportFilterValues,
} from 'types/filter';

export class Filter extends Object<Filter> {
  _id!: BSON.ObjectId;
  name!: string;
  type!: FilterType;
  values!:
    ModelFilterValues |
    BatteryFilterValues |
    EventReportFilterValues |
    MaintenanceReportFilterValues |
    ModelScanCodeReportFilterValues |
    BatteryScanCodeReportFilterValues;

  static schema: ObjectSchema = {
    name: 'Filter',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      type: 'string',
      values: 'FilterState{}',
    },
    primaryKey: '_id',
  };
};

export class FilterState extends Object<FilterState> {
  relation!: string;
  value?: string[];

  static schema: ObjectSchema = {
    name: 'FilterState',
    embedded: true,
    properties: {
      relation: 'string',
      value: 'string?[]',
    },
  };
};
