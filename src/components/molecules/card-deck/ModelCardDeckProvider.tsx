import React, { ReactNode } from 'react';

import { ModelCardDeckContext } from './ModelCardDeckContext';

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
