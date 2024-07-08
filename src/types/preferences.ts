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

export type DeckCardProperties = {
  colors: DeckCardColors;
};

export type ModelsDeckCardProperties = Record<string, DeckCardProperties>;
