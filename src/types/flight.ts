import { ISODateString } from './common';

export type Flight = {
  id: string;
  flightNumber: number;
  date: ISODateString;
};
