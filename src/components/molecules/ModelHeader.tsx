import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import React, { useState } from 'react';
import { getColoredSvg, useSelectAttachments, viewport } from '@react-native-ajp-elements/ui';

import { BSON } from 'realm';
import CircleButton from 'components/atoms/CircleButton';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { ModelType } from 'types/model';
import { SvgXml } from 'react-native-svg';
import { makeStyles } from '@rn-vui/themed';
import { modelTypeIcons } from 'lib/model';
import { useObject } from '@realm/react';

interface ModelHeaderInterface {
  modelId: string;
  modelType?: ModelType;
  onChangeImage?: (image?: string) => void;
  onGoBack?: () => void;
  scrollY?: SharedValue<number>;
}

export const ModelHeader = ({
  modelId,
  modelType,
  onChangeImage,
  onGoBack,
  scrollY,
}: ModelHeaderInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const selectAttachments = useSelectAttachments({
    selectFromCamera: true,
    selectFromCameraRoll: true,
  });

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const [image, setImage] = useState(model?.image || undefined);

  const modelTypeName = model
    ? (modelTypeIcons[model.type]?.name as string)
    : modelType
      ? (modelTypeIcons[modelType]?.name as string)
      : 'flag-checkered';

  const minHeight = theme.insets.top + 39;
  const maxHeight = 150;

  const backgroundOpacity = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      opacity: interpolate(scrollY.value, [0, 50], [1, 0], Extrapolation.CLAMP),
    };
  });

  const backgroundTranslateY = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      height: interpolate(scrollY.value, [0, 40], [maxHeight, minHeight], Extrapolation.CLAMP),
    };
  });

  const itemsOpacity = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      opacity: interpolate(scrollY.value, [0, 18], [1, 0], Extrapolation.CLAMP),
    };
  });

  const itemsTranslateY = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      transform: [
        { translateY: interpolate(scrollY.value, [0, maxHeight], [0, -300], Extrapolation.CLAMP) },
      ],
    };
  });

  const collapsedHeaderOpacity = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      opacity: interpolate(scrollY.value, [30, 50], [0, 1], Extrapolation.CLAMP),
    };
  });

  const deletePhoto = () => {
    setImage(undefined);
    onChangeImage && onChangeImage();
  };

  const selectModelImage = () => {
    selectAttachments({
      cropRect: { width: viewport.width * 5 * 1.3, height: viewport.width * 5 },
      customButtonDestructive: true,
      customButtonCallback: deletePhoto,
      customButtonLabel: image ? 'Delete Photo' : undefined,
    }).then(attachment => {
      if (attachment[0] && attachment[0].type === 'image') {
        const img = attachment[0].uri;
        setImage(img);
        onChangeImage && onChangeImage(img);
      }
    });
  };

  return (
    <>
      {/* Collapsed header */}
      <Animated.View style={[s.collapsedHeader, { height: minHeight }, collapsedHeaderOpacity]}>
        <Text style={s.title}>{model?.name}</Text>
      </Animated.View>
      {/* Background image */}
      <Animated.View style={[s.backgroundContainer, backgroundTranslateY, backgroundOpacity]}>
        {image ? (
          <Image source={{ uri: image }} resizeMode={'cover'} style={s.headerImage} />
        ) : (
          <View style={s.defaultHeaderImage}>
            <SvgXml
              xml={getColoredSvg(modelTypeName)}
              width={s.dedaultModelImage.width}
              height={'100%'}
              color={theme.colors.brandSecondary}
              style={s.dedaultModelImage}
            />
          </View>
        )}
      </Animated.View>
      {/* Left button */}
      {onGoBack && (
        <Pressable onPress={onGoBack} style={s.buttonLeftContainer}>
          <Animated.View style={collapsedHeaderOpacity}>
            <Icon name={'chevron-left'} style={[s.buttonLeft, s.buttonLeftCollapsed]} />
          </Animated.View>
          <Animated.View style={backgroundOpacity}>
            <Icon name={'chevron-left'} style={[s.buttonLeft]} />
          </Animated.View>
        </Pressable>
      )}
      {/* Items */}
      <Animated.View style={[s.itemsContainer, itemsTranslateY, itemsOpacity]}>
        <View style={s.buttonRightContainer}>
          <CircleButton
            size={30}
            icon={'camera'}
            onPress={() => (!model || (scrollY && scrollY.value < 5)) && selectModelImage()}
          />
        </View>
        <View style={s.insetImageContainer}>
          <SvgXml
            xml={getColoredSvg(modelTypeName)}
            width={75}
            height={75}
            color={theme.colors.hintGray}
            style={[s.insetImage]}
          />
        </View>
      </Animated.View>
    </>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  backgroundContainer: {
    height: 150,
    backgroundColor: theme.colors.lightGray,
  },
  buttonLeft: {
    top: -22,
    fontSize: 22,
    width: 50,
    color: theme.colors.whiteTransparentMid,
  },
  buttonLeftContainer: {
    position: 'absolute',
    left: 8,
    top: theme.insets.top + 5,
  },
  buttonRightContainer: {
    position: 'absolute',
    right: 15,
    top: theme.insets.top,
    alignItems: 'flex-end',
  },
  buttonLeftCollapsed: {
    top: 0,
    color: theme.colors.screenHeaderButtonText,
  },
  collapsedHeader: {
    backgroundColor: theme.colors.white,
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    shadowColor: theme.colors.stickyBlack,
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 0.35,
        },
        shadowOpacity: 0.25,
        shadowRadius: 0.35,
      },
      android: {
        elevation: 5,
        backgroundColor: theme.colors.black,
      },
    }),
  },
  defaultHeaderImage: {
    flex: 1,
    alignItems: 'center',
  },
  dedaultModelImage: {
    top: 20,
    width: 125,
    transform: [{ rotate: '-45deg' }],
  },
  title: {
    position: 'absolute',
    bottom: 12,
    ...theme.styles.textScreenTitle,
  },
  headerImage: {
    flex: 1,
  },
  itemsContainer: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  insetImage: {
    transform: [{ rotate: '-45deg' }],
    left: -3,
    top: -1,
  },
  insetImageContainer: {
    width: 70,
    height: 70,
    left: 35,
    top: 110,
    borderWidth: 3,
    borderRadius: 15,
    borderColor: theme.colors.viewBackground,
    backgroundColor: theme.colors.darkGray,
  },
}));
