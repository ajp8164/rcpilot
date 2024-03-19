import { ISODateString } from 'types/common';
import { createContext } from 'react';

export type DatabaseInfoContext = {
  databaseLastUpdate: ISODateString;
  databaseObjects: number;
  databaseSize: number;
  databaseVersion: number;
  databaseVersionDate: ISODateString;
};

export const DatabaseInfoContext = createContext<DatabaseInfoContext>({
  databaseLastUpdate: '',
  databaseObjects: 0,
  databaseSize: 0,
  databaseVersion: 0,
  databaseVersionDate: '',
});
