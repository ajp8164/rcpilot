import React, { useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import {
  ThemeManager,
  getColoredSvg,
  useDevice,
  useSelectAttachments,
  useTheme,
} from '@react-native-hello/ui';
import { useObject } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { modelTypeIconProps } from 'lib/model';
import { Camera, ChevronLeft } from 'lucide-react-native';
import { BSON } from 'realm';
import { Model } from 'realmdb/Model';
import { ModelType } from 'types/model';

interface ModelHeaderInterface {
  navHeader?: boolean;
  modelId: string;
  modelType?: ModelType;
  onChangeImage?: (image?: string) => void;
  onGoBack?: () => void;
  scrollY?: SharedValue<number>;
}

export const ModelHeader = ({
  navHeader,
  modelId,
  modelType,
  onChangeImage,
  onGoBack,
  scrollY,
}: ModelHeaderInterface) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  const selectAttachments = useSelectAttachments({
    selectFromCamera: true,
    selectFromCameraRoll: true,
  });

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const [image, setImage] = useState(model?.image || undefined);

  const modelTypeName = model
    ? modelTypeIconProps[model.type]?.name
    : modelType
      ? modelTypeIconProps[modelType]?.name
      : 'flag-checkered';

  const minHeight = device.insets.top + 39;
  const maxHeight = 200;

  const backgroundOpacity = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      opacity: interpolate(scrollY.value, [0, 50], [1, 0], Extrapolation.CLAMP),
    };
  });

  const backgroundTranslateY = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      height: interpolate(
        scrollY.value,
        [0, 90],
        [maxHeight, minHeight],
        Extrapolation.CLAMP,
      ),
    };
  });

  const itemsOpacity = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      opacity: interpolate(scrollY.value, [0, 25], [1, 0], Extrapolation.CLAMP),
    };
  });

  const itemsTranslateY = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, maxHeight],
            [0, -500],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const collapsedHeaderOpacity = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      opacity: interpolate(
        scrollY.value,
        [30, 50],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  const deletePhoto = () => {
    setImage(undefined);
    onChangeImage && onChangeImage();
  };

  const selectModelImage = () => {
    selectAttachments({
      cropRect: {
        width: device.screen.width * 5 * 1.3,
        height: device.screen.width * 5,
      },
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
      <Animated.View
        style={[
          s.collapsedHeader,
          { height: minHeight },
          collapsedHeaderOpacity,
        ]}>
        <Text style={s.title}>{model?.name}</Text>
      </Animated.View>
      {/* Background image */}
      <Animated.View
        style={[
          s.backgroundContainer,
          backgroundTranslateY,
          backgroundOpacity,
        ]}>
        {image ? (
          <Image
            source={{ uri: image }}
            resizeMode={'cover'}
            style={s.headerImage}
          />
        ) : (
          <View style={[s.defaultHeaderImage]}>
            <SvgXml
              xml={getColoredSvg(modelTypeName)}
              width={s.defaultModelImage.width}
              height={'100%'}
              color={theme.colors.brandSecondary}
              style={[
                s.defaultModelImage,
                navHeader ? { top: s.backgroundContainer.height / 6 } : {},
              ]}
            />
          </View>
        )}
      </Animated.View>
      {/* Left button */}
      {onGoBack && (
        <View style={[s.buttonLeftContainer]}>
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={
              <>
                <Animated.View style={collapsedHeaderOpacity}>
                  <ChevronLeft
                    color={theme.colors.screenHeaderButtonText}
                    size={33}
                  />
                </Animated.View>
                <Animated.View
                  style={[backgroundOpacity, { position: 'absolute' }]}>
                  <ChevronLeft
                    color={theme.colors.whiteTransparentMid}
                    size={33}
                  />
                </Animated.View>
              </>
            }
            onPress={onGoBack}
          />
        </View>
      )}
      {/* Right button */}
      <View style={[s.buttonRightContainer]}>
        <Button
          buttonStyle={theme.styles.buttonScreenHeader}
          icon={
            <>
              <Animated.View style={collapsedHeaderOpacity}>
                <Camera color={theme.colors.screenHeaderButtonText} size={33} />
              </Animated.View>
              <Animated.View
                style={[backgroundOpacity, { position: 'absolute' }]}>
                <Camera color={theme.colors.whiteTransparentMid} size={33} />
              </Animated.View>
            </>
          }
          onPress={selectModelImage}
        />
      </View>
      {/* Inset model icon */}
      <Animated.View style={[s.itemsContainer, itemsTranslateY, itemsOpacity]}>
        <View style={[s.insetImageContainer, navHeader ? { top: 165 } : {}]}>
          <SvgXml
            xml={getColoredSvg(modelTypeName)}
            width={s.insetImageContainer.width}
            height={s.insetImageContainer.height}
            color={theme.colors.hintGray}
            style={[s.insetImage]}
          />
        </View>
      </Animated.View>
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme, device }) => ({
  backgroundContainer: {
    height: 150,
    backgroundColor: theme.colors.lightGray,
  },
  buttonLeftContainer: {
    position: 'absolute',
    top: device.insets.top - 4,
    left: -7,
  },
  buttonRightContainer: {
    position: 'absolute',
    top: device.insets.top - 4,
    right: 7,
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
  defaultModelImage: {
    width: 125,
    transform: [{ rotate: '-45deg' }],
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  insetImageContainer: {
    width: 70,
    height: 70,
    left: 35,
    top: 115,
    borderWidth: 3,
    borderRadius: 15,
    borderColor: theme.colors.viewBackground,
    backgroundColor: theme.colors.darkGray,
  },
  title: {
    position: 'absolute',
    bottom: 12,
    ...theme.styles.textScreenTitle,
  },
}));
