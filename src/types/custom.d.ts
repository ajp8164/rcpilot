import '@types/gapi.youtube';

declare module '*.png';
declare module '*.svg';

export type PickEnum<T, K extends T> = {
  [P in keyof K]: P extends K ? P : never;
};
