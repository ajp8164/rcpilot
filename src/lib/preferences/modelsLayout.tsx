import { EnumPickerIconProps } from 'components/EnumPickerScreen';
import { GalleryHorizontalEnd, Images, LayoutList } from 'lucide-react-native';
import { theme } from 'theme';
import { ModelsLayout } from 'types/preferences';

export const modelsLayoutIcons: { [key in ModelsLayout]: EnumPickerIconProps } =
  {
    [ModelsLayout.CardDeck]: {
      leftContent: (
        <GalleryHorizontalEnd
          color={
            theme.mode === 'light'
              ? theme.lightColors?.listItemIcon
              : theme.darkColors?.listItemIcon
          }
          size={33}
        />
      ),
    },
    [ModelsLayout.List]: {
      leftContent: (
        <LayoutList
          color={
            theme.mode === 'light'
              ? theme.lightColors?.listItemIcon
              : theme.darkColors?.listItemIcon
          }
          size={33}
        />
      ),
    },
    [ModelsLayout.PostCards]: {
      leftContent: (
        <Images
          color={
            theme.mode === 'light'
              ? theme.lightColors?.listItemIcon
              : theme.darkColors?.listItemIcon
          }
          size={33}
        />
      ),
    },
  };
