import EventEmitter from 'eventemitter3';
import React, { ReactNode, createContext } from 'react';

const event = new EventEmitter();
export const EventContext = createContext<EventEmitter>(event);

export const EventProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  return (
    <EventContext.Provider value={event}>{children}</EventContext.Provider>
  );
};
