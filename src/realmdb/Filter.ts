import { BSON, Object, ObjectSchema } from 'realm';

import { FilterState } from 'components/molecules/filters';
import { FilterType } from 'types/filter';

export type FilterValues = {[key in string] : FilterState};

export class Filter extends Object<Filter> {
  _id!: BSON.ObjectId;
  name!: string;
  type!: FilterType;
  values!: FilterValues;

  static schema: ObjectSchema = {
    name: 'Filter',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      type: 'string',
      values: 'string{}',
    },
    primaryKey: '_id',
  };
};

// export class FilterValues extends Object<FilterValues> {
//   description!: string;
//   schedule!: ChecklistActionSchedule;
//   cost?: number;
//   notes?: string;
//   ordinal!: number;

//   static schema: ObjectSchema = {
//     name: 'FilterValues',
//     embedded: true,
//     properties: {
//       description: 'string',
//       schedule: 'ChecklistActionSchedule',
//       cost: 'float?',
//       notes: 'string?',
//       ordinal: 'float',
//     },
//   };
// };
