import { BSON, Object, ObjectSchema } from 'realm';
import { EventStyle } from 'realmdb/EventStyle';
import { Location } from 'realmdb/Location';
import { Model } from 'realmdb/Model';
import { ModelFuel } from 'realmdb/ModelFuel';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { Pilot } from 'realmdb/Pilot';
import { ISODateString } from 'types/common';
import { EventOutcome } from 'types/event';

import { BatteryCycle } from './BatteryCycle';

export class Event extends Object<Event> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  date!: ISODateString;
  number!: number;
  outcome?: EventOutcome;
  duration!: number;
  model!: Model;
  pilot!: Pilot;
  location?: Location;
  fuel?: ModelFuel;
  fuelConsumed?: number;
  propeller?: ModelPropeller;
  eventStyle?: EventStyle;
  batteryCycles!: BatteryCycle[];
  notes?: string;

  static schema: ObjectSchema = {
    name: 'Event',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      date: 'string',
      number: 'int',
      outcome: 'string?',
      duration: 'float',
      model: 'Model',
      pilot: 'Pilot',
      location: 'Location?',
      fuel: 'ModelFuel?',
      fuelConsumed: 'float?',
      propeller: 'ModelPropeller?',
      eventStyle: 'EventStyle?',
      batteryCycles: 'BatteryCycle[]',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
}
