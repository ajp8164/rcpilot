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

const ICON_PROPS: Record<string, { size: number; offsetX: number }> = {
  Check: { size: 28, offsetX: 0 },
  ChevronLeft: { size: 36, offsetX: 0 },
  ChevronRight: { size: 36, offsetX: 0 },
  ClockArrowDown: { size: 28, offsetX: 0 },
  ClockArrowUp: { size: 28, offsetX: 0 },
  Funnel: { size: 24, offsetX: 0 },
  FunnelPlus: { size: 24, offsetX: 0 },
  GalleryHorizontalEnd: { size: 28, offsetX: 0 },
  Images: { size: 28, offsetX: 0 },
  LayoutList: { size: 28, offsetX: 0 },
  Plus: { size: 28, offsetX: 0 },
  Share: { size: 28, offsetX: 0 },
  X: { size: 28, offsetX: 0 },
};

export const HeaderIconButton = ({
  Icon,
  onPress,
  color,
  buttonIndex = 0,
  size = 28,
  ...rest
}: HeaderIconButtonProps) => {
  const theme = useTheme();
  const s = useStyles();

  const iconName = Icon.displayName || Icon.name || '';
  const iconProps = ICON_PROPS[iconName] ?? { size, offsetX: 0 };

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
          size={iconProps.size}
          color={color || theme.colors.screenHeaderButtonText}
          style={{ marginLeft: buttonIndex > 0 ? 0 : iconProps.offsetX }}
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
