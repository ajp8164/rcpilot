import { EventContext } from'./EventProvider';
import React from 'react';

export const useEvent = () => {
  return React.useContext(EventContext);
};
