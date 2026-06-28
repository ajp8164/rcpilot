import React from 'react';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import type { LucideIcon } from 'lucide-react-native';

interface HeaderIconButtonProps extends Omit<Button, 'size'> {
  Icon: LucideIcon;
  onPress: () => void;
  buttonIndex?: number;
  color?: string;
  size?: number;
}

const ICON_SIZES: Record<string, number> = {
  Check: 28,
  ChevronLeft: 36,
  ChevronRight: 36,
  ClockArrowDown: 28,
  ClockArrowUp: 28,
  Funnel: 24,
  FunnelPlus: 24,
  GalleryHorizontalEnd: 28,
  Images: 28,
  LayoutList: 28,
  Plus: 28,
  Share: 28,
  X: 28,
};

export const HeaderIconButton = ({
  Icon,
  onPress,
  color,
  buttonIndex: _buttonIndex = 0,
  size = 28,
  ...rest
}: HeaderIconButtonProps) => {
  const theme = useTheme();
  const s = useStyles();

  const iconName = Icon.displayName || Icon.name || '';
  const iconSize = ICON_SIZES[iconName] ?? size;

  return (
    <Button
      buttonStyle={{
        ...theme.styles.buttonScreenHeader,
        ...s.forIcon,
      }}
      disabledStyle={{
        ...theme.styles.buttonScreenHeaderDisabled,
        ...s.forIcon,
      }}
      icon={
        <Icon
          size={iconSize}
          color={color || theme.colors.screenHeaderButtonText}
        />
      }
      onPress={onPress}
      {...rest}
    />
  );
};

// Marks this component as a header item so headerOptions can inject layout
// context (e.g. buttonIndex) for consistent spacing.
HeaderIconButton.isHeaderItem = true;

const useStyles = ThemeManager.createStyleSheet(() => ({
  forIcon: {
    width: 36,
    justifyContent: 'center',
  },
}));
