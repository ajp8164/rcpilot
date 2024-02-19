import { BSON, Object, ObjectSchema } from 'realm';
import { ISODateString, ISODurationString } from 'types/common';

import { BatteryCycle } from './BatteryCycle';
import { EventOutcome } from 'types/event';
import { EventStyle } from 'realmdb/EventStyle';
import { Location } from 'realmdb/Location';
import { Model } from 'realmdb/Model';
import { ModelFuel } from 'realmdb/ModelFuel';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { Pilot } from 'realmdb/Pilot';

export class Event extends Object<Event> {
  _id!: BSON.ObjectId;
  createdOn!: ISODateString;
  updatedOn!: ISODateString;
  number!: number;
  outcome?: EventOutcome;
  duration!: ISODurationString;
  model?: Model;
  pilot?: Pilot;
  location?: Location;
  fuel?: ModelFuel;
  propeller?: ModelPropeller;
  style?: EventStyle;
  fuelConsumed?: number;
  batteryCycle?: BatteryCycle;
  notes?: string;

  static schema: ObjectSchema = {
    name: 'Event',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      createdOn: 'string',
      updatedOn: 'string',
      number: 'int',
      outcome: 'string?',
      duration: 'string',
      model: 'Model?',
      pilot: 'Pilot?',
      location: 'Location?',
      fuel: 'ModelFuel?',
      propeller: 'ModelPropeller?',
      style: 'EventStyle?',
      fuelConsumed: 'float?',
      batteryCycle: 'BatteryCycle?',
      notes: 'string?',
    },
    primaryKey: '_id',
  };
};
