import '@rn-vui/themed';

declare module '@rn-vui/themed' {
  export interface Colors {
    readonly avatarColors: string[];
    readonly brandPrimary: string;
    readonly brandSecondary: string;
    readonly clearButtonText: string;
    readonly listItemBackgroundAlt: string;
    readonly screenHeaderButtonText: string;
    readonly tabBarActiveTint: string;
    readonly tabBarBackgroundActive: string;
    readonly tabBarBackgroundInactive: string;
    readonly tabBarBorder: string;
    readonly tabBarInactiveTint: string;
  }
}
