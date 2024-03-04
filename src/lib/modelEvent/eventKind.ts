import { ModelType } from 'types/model';

type EventKind = {
  name: string;
  namePlural: string;
};

const defaultKind: EventKind = {
  name: 'Event',
  namePlural: 'Events',
};

const kind: Record<ModelType, EventKind> = {
  [ModelType.Airplane]: {
    name: 'Flight',
    namePlural: 'Flights',
  },
  [ModelType.Boat]: {
    name: 'Cruise',
    namePlural: 'Cruises',
  },
  [ModelType.Car]: {
    name: 'Race',
    namePlural: 'Races',
  },
  [ModelType.Helicopter]: {
    name: 'Flight',
    namePlural: 'Flights',
  },
  [ModelType.Multicopter]: {
    name: 'Flight',
    namePlural: 'Flights',
  },
  [ModelType.Robot]: {
    name: 'Mission',
    namePlural: 'Missions',
  },
  [ModelType.Sailplane]: {
    name: 'Flight',
    namePlural: 'Flights',
  },
};

export const eventKind = (modelType?: ModelType) => {
  return modelType ? kind[modelType] : defaultKind;
};
