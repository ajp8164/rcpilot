import { Image, LayoutChangeEvent, LayoutRectangle, Pressable, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React, { useState } from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { makeStyles } from '@rneui/themed';
import { Model, Pilot } from 'realmdb';
import { modelMaintenanceIsDue, modelTypeIcons } from 'lib/model';
import { DateTime, Duration } from 'luxon';
import type FlipCardView from 'components/views/FlipCardView';
import { ellipsis } from '@react-native-ajp-elements/core';
import { getVendorImage } from 'theme/images';
import { SvgXml } from 'react-native-svg';
import { getColoredSvg } from '@react-native-ajp-elements/ui';
import { useSelector } from 'react-redux';
import { selectModelPreferences } from 'store/selectors/appSettingsSelectors';
import { defaultDinnCardColors } from './index';
import { eventKind } from 'lib/modelEvent';

interface DinnCardInterface extends FlipCardView {
  model: Model;
  pilot?: Pilot;
  onPressAchievements?: () => void;
  onPressEditCardProperties?: () => void;
  onPressEditModel?: () => void;
  onPressNewEventSequence?: () => void;
}

export const Front = ({
  flip,
  model,
  onPressAchievements,
  onPressEditCardProperties: _onPressEditCardProperties,
  onPressEditModel,
  onPressNewEventSequence,
  pilot,
}: DinnCardInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const totalTime = Duration.fromMillis(model.statistics.totalTime * 1000).toFormat('h:mm:ss');
  const lastEvent = model.lastEvent && DateTime.fromISO(model.lastEvent).toFormat('M/d/yyyy');
  const maintenanceIsDue = modelMaintenanceIsDue(model);
  const modelPreferences = useSelector(selectModelPreferences(model._id.toString()));
  const cardColors = modelPreferences?.deckCardColors || defaultDinnCardColors;

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
          <Image source={{ uri: model.image }} resizeMode={'cover'} style={s.modelImage} />
        ) : (
          <View style={s.defaultImage}>
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
        <View
          style={[
            s.background,
            { backgroundColor: cardColors.primary, borderColor: cardColors.accent1 },
          ]}>
          <View style={s.textContainer}>
            <Text style={[s.title, { color: cardColors.accent1 }]}>{ellipsis(model.name, 13)}</Text>
            <Text
              style={[
                s.text,
                { color: cardColors.accent1 },
              ]}>{`${model.statistics.totalEvents} Flights`}</Text>
            <Text style={[s.text, { color: cardColors.accent1 }]}>{`${totalTime} Total Time`}</Text>
            {lastEvent && (
              <Text
                style={[
                  s.text,
                  { color: cardColors.accent1 },
                ]}>{`${lastEvent} Last ${eventKind(model.type).name}`}</Text>
            )}
          </View>
          <View style={s.attributesContainer}>
            <Pressable
              style={[
                s.mainIconContainer,
                { backgroundColor: cardColors.accent2, borderColor: cardColors.accent1 },
              ]}
              onPress={onPressNewEventSequence}>
              <Icon
                name={'play'}
                size={28}
                style={[s.newEventIcon, { color: cardColors.primary }]}
              />
            </Pressable>
            {maintenanceIsDue && (
              <View style={[s.attributeIconContainer, { borderColor: cardColors.accent1 }]}>
                <Icon
                  name={'wrench'}
                  size={20}
                  style={[s.attributeIcon, { color: cardColors.accent2 }]}
                />
              </View>
            )}
            {model.damaged && (
              <View style={[s.attributeIconContainer, { borderColor: cardColors.accent1 }]}>
                <Icon
                  name={'bandage'}
                  size={18}
                  color={theme.colors.stickyWhite}
                  style={[
                    s.attributeIcon,
                    { color: cardColors.accent2, transform: [{ rotate: '30deg' }] },
                  ]}
                />
              </View>
            )}
            <Pressable
              style={[s.attributeIconContainer, { borderColor: cardColors.accent1 }]}
              onPress={onPressEditModel}>
              <Icon
                name={'info'}
                size={20}
                style={[s.attributeIcon, { color: cardColors.accent2 }]}
              />
            </Pressable>
            {pilot?.achievements && pilot.achievements.length > 0 && (
              <Pressable
                style={[s.attributeIconContainer, s.achievementIcon]}
                onPress={onPressAchievements}>
                <Icon
                  name={'certificate'}
                  size={34}
                  style={[s.attributeIcon, { color: cardColors.accent1 }]}
                />
                <Text style={[s.achievementCount, { color: cardColors.accent2 }]}>
                  {`${pilot?.achievements?.length}`}
                </Text>
              </Pressable>
            )}
          </View>
          {vendorImage && (
            <Image
              source={vendorImage.src}
              resizeMode={'contain'}
              tintColor={cardColors.accent1}
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
    height: '35%',
    backgroundColor: theme.colors.stickyBlack,
    position: 'absolute',
    bottom: 0,
    borderTopWidth: 10,
    borderColor: theme.colors.darkGray,
  },
  defaultImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#bbddff',
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
  achievementIcon: {
    width: 40,
    height: 40,
    borderColor: theme.colors.transparent,
  },
  attributeIcon: {
    color: theme.colors.lightGray,
  },
  achievementCount: {
    ...theme.styles.textNormal,
    ...theme.styles.textBold,
    position: 'absolute',
  },
  textContainer: {
    left: 105,
    top: 12,
  },
  title: {
    ...theme.styles.textHeading2,
    color: theme.colors.darkGray,
    marginTop: -2,
    marginBottom: 7,
  },
  text: {
    ...theme.styles.textSmall,
    color: theme.colors.darkGray,
    marginBottom: 5,
  },
  mainIconContainer: {
    width: 60,
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
  modelImage: {
    width: '100%',
    height: '100%',
    top: '-17.5%', // Half of background height
  },
  newEventIcon: {
    left: 2,
  },
  vendorImage: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
}));
