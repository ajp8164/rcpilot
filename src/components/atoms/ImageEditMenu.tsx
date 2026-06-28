import React, { ReactNode } from 'react';

import { MenuView, MenuAction } from '@react-native-menu/menu';

export enum ImageSize {
  Short = '100',
  Medium = '150',
  Tall = '200',
}

interface ImageEditMenuInterface {
  children: ReactNode | ReactNode[];
  heightValue: ImageSize;
  onChangeImage: () => void;
  onHeightSelect: (size: ImageSize) => void;
  onRemoveImage: () => void;
}

const ImageEditMenu = ({
  children,
  heightValue,
  onChangeImage,
  onHeightSelect,
  onRemoveImage,
}: ImageEditMenuInterface) => {
  const actions: MenuAction[] = [
    {
      id: 'change-image',
      title: 'Change Image',
    },
    {
      id: 'image-height',
      title: 'Image Height',
      subactions: [
        {
          id: `height-${ImageSize.Short}`,
          title: 'Short',
          state: heightValue === ImageSize.Short ? 'on' : 'off',
        },
        {
          id: `height-${ImageSize.Medium}`,
          title: 'Medium',
          state: heightValue === ImageSize.Medium ? 'on' : 'off',
        },
        {
          id: `height-${ImageSize.Tall}`,
          title: 'Tall',
          state: heightValue === ImageSize.Tall ? 'on' : 'off',
        },
      ],
    },
    {
      id: 'remove-image',
      title: 'Remove Image',
      attributes: { destructive: true },
    },
  ];

  return (
    <MenuView
      actions={actions}
      onPressAction={({ nativeEvent }) => {
        switch (nativeEvent.event) {
          case 'change-image':
            onChangeImage();
            break;
          case `height-${ImageSize.Short}`:
            onHeightSelect(ImageSize.Short);
            break;
          case `height-${ImageSize.Medium}`:
            onHeightSelect(ImageSize.Medium);
            break;
          case `height-${ImageSize.Tall}`:
            onHeightSelect(ImageSize.Tall);
            break;
          case 'remove-image':
            onRemoveImage();
            break;
        }
      }}>
      {children}
    </MenuView>
  );
};

export default ImageEditMenu;
