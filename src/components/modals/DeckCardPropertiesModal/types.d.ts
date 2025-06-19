import React from 'react';

export declare type DeckCardPropertiesModal = DeckCardPropertiesModalMethods;

declare const LegalModal: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    DeckCardPropertiesModalProps &
      React.RefAttributes<CDeckardPropertiesModalMethods>
  >
>;

export interface DeckCardPropertiesModalProps {
  snapPoints?: (string | number)[];
}

export interface DeckCardPropertiesModalMethods {
  dismiss: () => void;
  present: (modelId: string) => void;
}
