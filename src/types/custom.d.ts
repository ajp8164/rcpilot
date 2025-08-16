export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PickEnum<T, K extends T> = {
  [P in keyof K]: P extends K ? P : never;
};
