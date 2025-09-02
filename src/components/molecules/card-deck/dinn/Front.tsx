import React, { useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  LayoutRectangle,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';

import { ellipsis } from '@react-native-hello/core';
import { ThemeManager, getColoredSvg, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import type FlipCardView from 'components/views/FlipCardView';
import { getVendorImage } from 'images';
import { modelMaintenanceIsDue, modelTypeIconProps } from 'lib/model';
import { eventKind } from 'lib/modelEvent';
import { Bandage, Info, PlayCircle, Trophy, Wrench } from 'lucide-react-native';
import { DateTime, Duration } from 'luxon';
import { Commander, Model } from 'realmdb';
import { selectModelPreferences } from 'store/selectors/appSettingsSelectors';

import { defaultDinnCardColors } from './index';

interface DinnCardInterface extends FlipCardView {
  model: Model;
  commander?: Commander;
  onPressAchievements?: () => void;
  onPressEditCardProperties?: () => void;
  onPressEditModel?: () => void;
  onPressNewEventSequence?: () => void;
}

export const Front = ({
  flip,
  model,
  onPressAchievements = () => null,
  onPressEditCardProperties: _onPressEditCardProperties,
  onPressEditModel = () => null,
  onPressNewEventSequence = () => null,
  commander,
}: DinnCardInterface) => {
  const theme = useTheme();
  const s = useStyles();

  const totalTime = Duration.fromMillis(
    model.statistics.totalTime * 1000,
  ).toFormat('h:mm:ss');
  const lastEvent =
    model.lastEvent && DateTime.fromISO(model.lastEvent).toFormat('M/d/yyyy');
  const maintenanceIsDue = modelMaintenanceIsDue(model);
  const modelPreferences = useSelector(
    selectModelPreferences(model._id.toString()),
  );
  const cardColors = modelPreferences?.deckCardColors || defaultDinnCardColors;

  const handlePress = () => {
    flip?.();
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
          <Image
            source={{ uri: model.image }}
            resizeMode={'cover'}
            style={s.modelImage}
          />
        ) : (
          <View style={s.defaultImage}>
            <SvgXml
              xml={getColoredSvg(modelTypeIconProps[model.type]?.name)}
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
            {
              backgroundColor: cardColors.primary,
              borderColor: cardColors.accent1,
            },
          ]}>
          <View style={s.textContainer}>
            <Text style={[s.title, { color: cardColors.accent1 }]}>
              {ellipsis(model.name, 13)}
            </Text>
            <Text
              style={[
                s.text,
                { color: cardColors.accent1 },
              ]}>{`${model.statistics.totalEvents} Flights`}</Text>
            <Text
              style={[
                s.text,
                { color: cardColors.accent1 },
              ]}>{`${totalTime} Total Time`}</Text>
            {lastEvent && (
              <Text
                style={[
                  s.text,
                  { color: cardColors.accent1 },
                ]}>{`${lastEvent} Last ${eventKind(model.type).name}`}</Text>
            )}
          </View>
          <View style={s.attributesContainer}>
            <View style={s.playContainer}>
              {/* The icon behind the button create a good active press ui. */}
              <PlayCircle
                color={cardColors.accent2}
                fill={cardColors.accent2}
                size={60}
                style={s.playBehind}
              />
              <Button
                buttonStyle={{ ...theme.styles.buttonScreenHeader, height: 60 }}
                icon={
                  <PlayCircle
                    color={cardColors.accent2}
                    fill={cardColors.accent1}
                    size={60}
                  />
                }
                onPress={() => onPressNewEventSequence()}
              />
            </View>
            {maintenanceIsDue && (
              <Button
                buttonStyle={theme.styles.buttonScreenHeader}
                containerStyle={{
                  ...s.attributeIconContainer,
                  borderColor: cardColors.accent1,
                }}
                icon={<Wrench color={cardColors.accent1} size={20} />}
                onPress={() => null}
              />
            )}
            {model.damaged && (
              <Button
                buttonStyle={theme.styles.buttonScreenHeader}
                containerStyle={{
                  ...s.attributeIconContainer,
                  borderColor: cardColors.accent1,
                }}
                icon={<Bandage color={cardColors.accent1} size={20} />}
                onPress={() => null}
              />
            )}
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              containerStyle={{
                ...s.attributeIconContainer,
                borderColor: cardColors.accent1,
              }}
              icon={<Info color={cardColors.accent1} size={40} />}
              onPress={() => onPressEditModel()}
            />
            {commander?.achievements && commander.achievements.length > 0 && (
              <Button
                buttonStyle={theme.styles.buttonScreenHeader}
                containerStyle={{
                  ...s.attributeIconContainer,
                  borderColor: cardColors.accent1,
                }}
                icon={<Trophy color={cardColors.accent1} size={20} />}
                onPress={() => onPressAchievements()}
              />
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
                    (cardLayout.width * 0.2) /
                    (vendorImage.size.width / vendorImage.size.height),
                },
              ]}
            />
          )}
        </View>
      </Pressable>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
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
    width: 37,
    height: 37,
    borderColor: theme.colors.darkGray,
    borderWidth: 3.2,
    marginBottom: 5,
    borderRadius: 37,
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
    ...theme.text.normal,
    fontFamily: theme.fonts.bold,
    position: 'absolute',
  },
  textContainer: {
    left: 105,
    top: 12,
  },
  title: {
    ...theme.text.h2,
    color: theme.colors.darkGray,
    marginTop: -2,
    marginBottom: 7,
  },
  text: {
    ...theme.text.small,
    color: theme.colors.darkGray,
    marginBottom: 5,
  },
  modelImage: {
    width: '100%',
    height: '100%',
    top: '-17.5%', // Half of background height
  },
  newEventIcon: {
    left: 2,
  },
  playBehind: {
    position: 'absolute',
    left: 5,
  },
  playContainer: {
    marginBottom: 3,
  },
  vendorImage: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
}));
