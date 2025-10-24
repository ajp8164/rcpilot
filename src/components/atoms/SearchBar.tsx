import React, { useEffect, useState } from 'react';
import { Platform, Pressable, TextInput, View, ViewStyle } from 'react-native';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { CircleX, Search } from 'lucide-react-native';

interface SearchBarInterface {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  debounceDelay?: number;
  style?: ViewStyle;
}

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search',
  autoFocus = false,
  debounceDelay = 300,
  style,
}: SearchBarInterface) => {
  const theme = useTheme();
  const s = useStyles();

  const [internalValue, setInternalValue] = useState(value);

  // Debounce effect: delay calling onChangeText until user stops typing.
  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChangeText(internalValue);
      }
    }, debounceDelay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue, debounceDelay, value]);

  return (
    <View style={[s.container, style]}>
      <Search size={20} color={theme.colors.midGray} style={s.searchIcon} />
      <TextInput
        value={internalValue}
        onChangeText={setInternalValue}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textPlaceholder}
        selectTextOnFocus={true}
        autoFocus={autoFocus}
        style={[internalValue.length ? { top: 0.8 } : {}, s.input]}
        returnKeyType={'search'}
      />
      {internalValue?.length > 0 && (
        <Pressable onPress={() => setInternalValue('')}>
          <CircleX size={18} color={theme.colors.midGray} />
        </Pressable>
      )}
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 6 : 2,
    marginVertical: 8,
  },
  input: {
    ...theme.text.normal,
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 8 : 2,
  },
  searchIcon: {
    marginLeft: 5,
    marginRight: 6,
  },
}));

export default SearchBar;
