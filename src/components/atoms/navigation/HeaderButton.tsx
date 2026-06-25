import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import type { LucideIcon } from 'lucide-react-native';

interface HeaderButtonProps extends Omit<Button, 'title'> {
  label: string;
  onPress: () => void;
  // Optional leading/trailing icon rendered alongside the label.
  Icon?: LucideIcon;
  iconRight?: boolean;
  iconSize?: number;
  // Override the default header text/icon color.
  color?: string;
  // Injected by headerOptions to identify position within a group of items.
  buttonIndex?: number;
}

// Provides a uniform text button (with optional icon) for native stack headers.
// Encapsulates the standard screen header styling so screens don't duplicate it.
export const HeaderButton = ({
  label,
  onPress,
  Icon,
  iconRight,
  iconSize = 33,
  color,
  // buttonIndex is accepted (and discarded) so headerOptions can pass it
  // uniformly to all header items without leaking the prop onto Button.
  buttonIndex: _buttonIndex,
  ...rest
}: HeaderButtonProps) => {
  const theme = useTheme();

  const colorStyle = color ? { color } : {};

  return (
    <Button
      title={label}
      titleStyle={{ ...theme.styles.buttonScreenHeaderTitle, ...colorStyle }}
      buttonStyle={theme.styles.buttonScreenHeader}
      disabledTitleStyle={{
        ...theme.styles.buttonScreenHeaderTitle,
        ...colorStyle,
      }}
      disabledStyle={theme.styles.buttonScreenHeaderDisabled}
      iconRight={iconRight}
      icon={
        Icon ? (
          <Icon
            size={iconSize}
            color={color || theme.colors.screenHeaderButtonText}
          />
        ) : undefined
      }
      onPress={onPress}
      {...rest}
    />
  );
};

// Marks this component as a header item so headerOptions can inject layout
// context (e.g. buttonIndex) for consistent spacing.
HeaderButton.isHeaderItem = true;
