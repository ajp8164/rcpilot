import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import type { LucideIcon } from 'lucide-react-native';

interface HeaderIconButtonProps extends Omit<Button, 'size'> {
  Icon: LucideIcon;
  onPress: () => void;
  color?: string;
  size?: number;
}

const ICON_PROPS: Record<string, { size: number; offsetX: number }> = {
  ChevronLeft: { size: 33, offsetX: 0 },
  ChevronRight: { size: 33, offsetX: 0 },
  ClockArrowDown: { size: 28, offsetX: 4 },
  ClockArrowUp: { size: 28, offsetX: 4 },
  Funnel: { size: 24, offsetX: 0 },
  FunnelPlus: { size: 24, offsetX: 0 },
  GalleryHorizontalEnd: { size: 28, offsetX: 4 },
  Images: { size: 28, offsetX: 4 },
  LayoutList: { size: 28, offsetX: 4 },
  Plus: { size: 28, offsetX: 4 },
  Share: { size: 28, offsetX: 4 },
};

export const HeaderIconButton = ({
  Icon,
  onPress,
  color,
  size = 28,
  ...rest
}: HeaderIconButtonProps) => {
  const theme = useTheme();
  const iconName = Icon.displayName || Icon.name || '';
  const iconProps = ICON_PROPS[iconName] ?? { size, offsetX: 0 };

  return (
    <Button
      buttonStyle={theme.styles.buttonScreenHeader}
      disabledStyle={theme.styles.buttonScreenHeaderDisabled}
      icon={
        <Icon
          size={iconProps.size}
          color={color || theme.colors.screenHeaderButtonText}
          style={{ marginLeft: iconProps.offsetX }}
        />
      }
      onPress={onPress}
      {...rest}
    />
  );
};
