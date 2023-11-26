import { EventContext } from'./EventProvider';
import { useContext } from 'react';

export const useEvent = () => {
  return useContext(EventContext);
};
