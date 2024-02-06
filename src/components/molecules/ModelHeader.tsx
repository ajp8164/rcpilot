import { AppTheme, useTheme } from 'theme';
import { Image, Pressable, View } from 'react-native';
import React, { useState } from 'react';

import { BSON } from 'realm';
import CircleButton from 'components/atoms/CircleButton';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { makeStyles } from '@rneui/themed';
import { selectImage } from '@react-native-ajp-elements/ui';
import { useObject } from '@realm/react';

interface ModelHeaderInterface {
  modelId: string;
  onChangeImage?: (image?: string) => void;
  onGoBack?: () => void;
}

export const ModelHeader = ({
  modelId,
  onChangeImage,
  onGoBack,
}: ModelHeaderInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const [image, setImage] = useState(model?.image || undefined);

  const selectModelImage = () => {
    selectImage({
      onSuccess: imageAssets => {
        const img = imageAssets[0].uri;
        setImage(img)
        onChangeImage && onChangeImage(img);
      },
    });
  };

  return (
    <View style={s.headerContainer}>
      <Image
        source={{ uri: image }}
        resizeMode={'cover'}
        style={s.headerImage}
      />
      <View style={s.headerButtonRightContainer}>
        <CircleButton
          size={30}
          icon={'camera'}
          onPress={selectModelImage}
        />
      </View>
      {onGoBack && <Pressable
        onPress={onGoBack}
        style={s.headerButtonLeftContainer}>
        <Icon
          name={'chevron-left'}
          style={s.buttonLeft}
        />
      </Pressable>}
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerContainer: {
    overflow: 'visible',
    width: '100%',
    height: 150,
    backgroundColor: theme.colors.lightGray,
  },
  headerImage: {
    flex: 1,
  },
  headerButtonRightContainer: {
    position: 'absolute',
    right: 15,
    top: theme.insets.top,
  },
  headerButtonLeftContainer: {
    position: 'absolute',
    left: 8,
    top: theme.insets.top + 5,
  },
  buttonLeft: {
    fontSize: 22,
    color: theme.colors.whiteTransparentMid,
  },
}));
