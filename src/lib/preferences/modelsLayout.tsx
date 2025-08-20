import { ThemeManager } from '@react-native-hello/ui';
import { EnumPickerIconProps } from 'components/EnumPickerScreen';
import { GalleryHorizontalEnd, Images, LayoutList } from 'lucide-react-native';
import { ModelsLayout } from 'types/preferences';

export const modelsLayoutIcons: { [key in ModelsLayout]: EnumPickerIconProps } =
  {
    [ModelsLayout.CardDeck]: {
      leftContent: (
        <GalleryHorizontalEnd
          color={ThemeManager.theme.colors.listItemIcon}
          size={33}
        />
      ),
    },
    [ModelsLayout.List]: {
      leftContent: (
        <LayoutList color={ThemeManager.theme.colors.listItemIcon} size={33} />
      ),
    },
    [ModelsLayout.PostCards]: {
      leftContent: (
        <Images color={ThemeManager.theme.colors.listItemIcon} size={33} />
      ),
    },
  };
