import * as DropdownMenu from 'zeego/dropdown-menu';

import { AppTheme, useTheme } from 'theme';

import React from 'react';
import { ReactNode } from 'react';
import { makeStyles } from '@rn-vui/themed';

// const itemHeight = 25;

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
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <>{children}</>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content style={s.content}>
        <DropdownMenu.Item key={'change-image'} onSelect={onChangeImage}>
          <DropdownMenu.ItemTitle>{'Change Image'}</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
        {/* @ts-ignore property is incorrectly typed */}
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger style={s.item} key={'image-height'}>
            <DropdownMenu.ItemTitle>Image Height</DropdownMenu.ItemTitle>
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent style={s.content}>
            <DropdownMenu.CheckboxItem
              style={s.item}
              key={'image-short'}
              value={heightValue === ImageSize.Short}
              onValueChange={() => onHeightSelect(ImageSize.Short)}>
              <DropdownMenu.ItemIndicator>
                {/* <Ionicons name="checkmark" size={19} /> */}
              </DropdownMenu.ItemIndicator>
              <DropdownMenu.ItemTitle>{'Short'}</DropdownMenu.ItemTitle>
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              style={s.item}
              key={'image-medium'}
              value={heightValue === ImageSize.Medium}
              onValueChange={() => onHeightSelect(ImageSize.Medium)}>
              <DropdownMenu.ItemIndicator>
                {/* <Ionicons name="checkmark" size={19} /> */}
              </DropdownMenu.ItemIndicator>
              <DropdownMenu.ItemTitle>{'medium'}</DropdownMenu.ItemTitle>
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              style={s.item}
              key={'image-tall'}
              value={heightValue === ImageSize.Tall}
              onValueChange={() => onHeightSelect(ImageSize.Tall)}>
              <DropdownMenu.ItemIndicator>
                {/* <Ionicons name="checkmark" size={19} /> */}
              </DropdownMenu.ItemIndicator>
              <DropdownMenu.ItemTitle>{'Tall'}</DropdownMenu.ItemTitle>
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item
            key={'remove-image'}
            destructive
            onSelect={onRemoveImage}>
            <DropdownMenu.ItemTitle>{'Remove Image'}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  item: {
    // borderRadius: 3,
    // justifyContent: 'center',
    // paddingRight: 5,
    // paddingLeft: itemHeight,
    // height: itemHeight,
  },
  content: {
    // minWidth: 220,
    // backgroundColor: theme.colors.assertive,
    // borderRadius: 6,
    // padding: 5,
    // borderWidth: 1,
    // borderColor: 'red', // theme.colors.whiteTransparentMid,
  },
}));

export default ImageEditMenu;
