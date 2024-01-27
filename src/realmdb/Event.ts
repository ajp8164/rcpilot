import { BSON, Object, ObjectSchema } from 'realm';
import { ISODateString, ISODurationString } from 'types/common';

import { BatteryCycle } from './BatteryCycle';
import { EventOutcome } from 'types/event';
import { EventStyle } from 'realmdb/EventStyle';
import { Model } from 'realmdb/Model';
import { ModelFuel } from 'realmdb/ModelFuel';
import { ModelPropeller } from 'realmdb/ModelPropeller';
import { Pilot } from 'realmdb/Pilot';

export class Event extends Object<Event> {
  _id!: BSON.ObjectId;
  number!: number;
  outcome?: EventOutcome;
  date!: ISODateString;
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
      number: 'int',
      outcome: 'string?',
      date: 'string',
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
