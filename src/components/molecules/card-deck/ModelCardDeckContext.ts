import { createContext } from 'react';
import { SharedValue } from 'react-native-reanimated';

export type CardState = Record<
  string,
  {
    isFlipped: SharedValue<boolean>;
  }
>;

export type ModelCardDeckContext = {
  cardState: CardState;
};

export const ModelCardDeckContext = createContext<ModelCardDeckContext>({
  cardState: {},
});
