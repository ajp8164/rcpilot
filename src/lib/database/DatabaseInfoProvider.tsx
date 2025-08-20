import { ReactNode, createContext } from 'react';

import { ISODateString } from 'types/common';

import { useDatabaseInfo } from '.';

export type DatabaseInfoType = {
  databaseLastUpdate: ISODateString;
  databaseObjects: number;
  databaseSize: number;
  databaseVersion: number;
  databaseVersionDate: ISODateString;
};

export type DatabaseInfoContext = {
  info: DatabaseInfoType;
};

export const DatabaseInfoContext = createContext<DatabaseInfoContext>({
  info: {
    databaseLastUpdate: '',
    databaseObjects: 0,
    databaseSize: 0,
    databaseVersion: 0,
    databaseVersionDate: '',
  },
});

export const DatabaseInfoProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const info = useDatabaseInfo();
  return (
    <DatabaseInfoContext.Provider value={info}>
      {children}
    </DatabaseInfoContext.Provider>
  );
};
