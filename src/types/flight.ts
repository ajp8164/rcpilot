import { ISODateString } from './common';

export enum FlightOutcome {
  Unspecified = 'Unspecified',
  Star1 = '1',
  Star2 = '2',
  Star3 = '3',
  Star4 = '4',
  Crashed = 'Crashed',
};

export type Flight = {
  id: string;
  flightNumber: number;
  date: ISODateString;
};
