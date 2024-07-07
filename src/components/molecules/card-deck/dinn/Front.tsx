import { Image, LayoutChangeEvent, LayoutRectangle, Pressable, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React, { useState } from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { makeStyles } from '@rneui/themed';
import { Model } from 'realmdb';
import { modelMaintenanceIsDue, modelTypeIcons } from 'lib/model';
import { DateTime, Duration } from 'luxon';
import type FlipCardView from 'components/views/FlipCardView';
import { ellipsis } from '@react-native-ajp-elements/core';
import { getVendorImage } from 'theme/images';
import { SvgXml } from 'react-native-svg';
import { getColoredSvg } from '@react-native-ajp-elements/ui';

interface DinnCardInterface extends FlipCardView {
  model: Model;
  onPressEditModel?: () => void;
  onPressNewEventSequence?: () => void;
}

export const Front = ({
  flip,
  model,
  onPressEditModel,
  onPressNewEventSequence,
}: DinnCardInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const totalTime = Duration.fromMillis(model.statistics.totalTime * 1000).toFormat('h:mm:ss');
  const lastFlight = model.lastEvent && DateTime.fromISO(model.lastEvent).toFormat('M/dd/yyyy');
  const maintenanceIsDue = modelMaintenanceIsDue(model);

  const primaryColor = '#102013';
  const accent1Color = '#777A15';
  const accent2Color = '#4B5C21';

  const handlePress = () => {
    flip && flip();
  };

  const vendorImage = getVendorImage(model.vendor);

  const [cardLayout, setCardLayout] = useState<LayoutRectangle>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const onLayout = (event: LayoutChangeEvent) => {
    setCardLayout(event.nativeEvent.layout);
  };

  return (
    <View style={s.container} onLayout={onLayout}>
      <Pressable onPress={handlePress}>
        {model.image ? (
          <Image source={{ uri: model.image }} resizeMode={'cover'} style={s.modelImageFront} />
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#bbddff',
            }}>
            <SvgXml
              xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
              width={'100%'}
              height={'65%'}
              color={theme.colors.brandSecondary}
              style={{
                transform: [{ rotate: '-45deg' }],
              }}
            />
          </View>
        )}
        <View style={[s.background, { backgroundColor: primaryColor, borderColor: accent1Color }]}>
          <View style={s.textContainer}>
            <Text style={[s.title, { color: accent1Color }]}>{ellipsis(model.name, 13)}</Text>
            <Text
              style={[
                s.text,
                { color: accent1Color },
              ]}>{`${model.statistics.totalEvents} Flights`}</Text>
            <Text style={[s.text, { color: accent1Color }]}>{`${totalTime} Total Time`}</Text>
            {lastFlight && <Text style={s.text}>{`${lastFlight} Last Flight`}</Text>}
          </View>
          <View style={s.attributesContainer}>
            <Pressable
              style={[
                s.mainIconContainer,
                { backgroundColor: accent2Color, borderColor: accent1Color },
              ]}
              onPress={onPressNewEventSequence}>
              <Icon name={'play'} size={28} style={[s.newEventIcon, { color: primaryColor }]} />
            </Pressable>
            {maintenanceIsDue && (
              <View style={[s.attributeIconContainer, { borderColor: accent1Color }]}>
                <Icon
                  name={'wrench'}
                  size={20}
                  style={[s.attributeIcon, { color: accent2Color }]}
                />
              </View>
            )}
            {model.damaged && (
              <View style={[s.attributeIconContainer, { borderColor: accent1Color }]}>
                <Icon
                  name={'bandage'}
                  size={18}
                  color={theme.colors.stickyWhite}
                  style={[
                    s.attributeIcon,
                    { color: accent2Color, transform: [{ rotate: '30deg' }] },
                  ]}
                />
              </View>
            )}
            <Pressable
              style={[s.attributeIconContainer, { borderColor: accent1Color }]}
              onPress={onPressEditModel}>
              <Icon name={'info'} size={20} style={[s.attributeIcon, { color: accent2Color }]} />
            </Pressable>
          </View>
          {vendorImage && (
            <Image
              source={vendorImage.src}
              resizeMode={'contain'}
              tintColor={accent1Color}
              style={[
                s.vendorImage,
                {
                  width: cardLayout.width * 0.2,
                  height:
                    (cardLayout.width * 0.2) / (vendorImage.size.width / vendorImage.size.height),
                },
              ]}
            />
          )}
        </View>
      </Pressable>
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: theme.colors.stickyWhite,
  },
  background: {
    width: '100%',
    height: '35.2%',
    backgroundColor: theme.colors.stickyBlack,
    position: 'absolute',
    bottom: 0,
    borderTopWidth: 10,
    borderColor: theme.colors.darkGray,
  },
  attributesContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: -36,
    left: 40,
  },
  attributeIconContainer: {
    width: 34,
    height: 34,
    borderColor: theme.colors.darkGray,
    borderWidth: 2.5,
    marginBottom: 5,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attributeIcon: {
    color: theme.colors.lightGray,
  },
  textContainer: {
    left: 105,
    top: 12,
  },
  title: {
    ...theme.styles.textXL,
    ...theme.styles.textBold,
    color: theme.colors.darkGray,
    marginBottom: 13,
  },
  text: {
    ...theme.styles.textSmall,
    color: theme.colors.darkGray,
    marginBottom: 5,
  },
  mainIconContainer: {
    width: 60,
    // height: undefined, //59,
    aspectRatio: 1,
    borderColor: theme.colors.darkGray,
    borderWidth: 5.5,
    borderRadius: 50,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    top: -1,
    marginBottom: 11,
  },
  modelImageFront: {
    width: '100%',
    height: '100%',
  },
  newEventIcon: {
    left: 2,
  },
  fuelIcon: {
    left: 2,
  },
  batteryIcon: {
    transform: [{ rotate: '-90deg' }],
  },
  vendorImage: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
}));
