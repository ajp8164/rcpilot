import { ModelCardDeckContext } from './ModelCardDeckContext';
import React, { ReactNode } from 'react';

export const ModelCardDeckProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const cardState = {};

  return (
    <ModelCardDeckContext.Provider
      value={{
        cardState,
      }}>
      {children}
    </ModelCardDeckContext.Provider>
  );
};
