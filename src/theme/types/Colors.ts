import '@rneui/themed';

declare module '@rneui/themed' {
  export interface Colors {
    readonly avatarColors: string[];
    readonly clearButtonText: string;
    readonly listItemBackgroundAlt: string;
    readonly screenHeaderButtonText: string;
  }
}
