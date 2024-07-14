export enum ModelsLayout {
  CardDeck = 'Card Deck',
  List = 'List',
  PostCards = 'Post Cards',
}

export type DeckCardColors = {
  primary: string;
  accent1: string;
  accent2: string;
};

export type ModelPreferences = {
  deckCardColors: DeckCardColors;
};

// Key is model id.
export type ModelsPreferences = Record<string, ModelPreferences>;
