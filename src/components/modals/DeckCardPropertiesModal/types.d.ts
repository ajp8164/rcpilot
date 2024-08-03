import React from 'react';
import { DeckCardColors } from 'types/preferences';

export declare type DeckCardPropertiesModal = DeckCardPropertiesModalMethods;

declare const LegalModal: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    DeckCardPropertiesModalProps & React.RefAttributes<CDeckardPropertiesModalMethods>
  >
>;

export interface DeckCardPropertiesModalProps {
  snapPoints?: (string | number)[];
  onChangeColors: (colors: DeckCardColors) => void;
}

export interface DeckCardPropertiesModalMethods {
  dismiss: () => void;
  present: ({ colors }: { colors: DeckCardColors }) => void;
}
