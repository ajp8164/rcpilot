import { Platform, NativeModules } from 'react-native';

// Detect the device's country code (ISO 2-letter, uppercase).
// Falls back to 'US' if detection fails.
export const getDeviceCountry = (): string => {
  try {
    if (Platform.OS === 'ios') {
      const locale =
        NativeModules.SettingsManager?.settings?.AppleLocale || // iOS < 13
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        '';
      // Format: "en_US" or "en-US"
      const region = locale.split(/[-_]/)[1]?.toUpperCase();
      if (region && region.length === 2) return region;
    }

    // Fallback: use Intl (works on Hermes)
    const locale = Intl.DateTimeFormat().resolvedOptions().locale; // e.g. "en-US"
    const region = locale.split('-')[1]?.toUpperCase();
    if (region && region.length === 2) return region;
  } catch {
    // Ignore detection errors
  }

  return 'US';
};
