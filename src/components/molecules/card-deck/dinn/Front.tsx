import { Image, Pressable, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { makeStyles } from '@rneui/themed';
import { Model } from 'realmdb';
import { SvgXml } from 'react-native-svg';
import { getColoredSvg } from '@react-native-ajp-elements/ui';
import { modelMaintenanceIsDue } from 'lib/model';
import { DateTime, Duration } from 'luxon';
import type FlipCardView from 'components/views/FlipCardView';

interface DinnCardInterface extends FlipCardView {
  model: Model;
}

export const Front = ({ model, flip }: DinnCardInterface) => {
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

  return (
    <View style={s.container}>
      <Pressable onPress={handlePress}>
        <Image
          source={require('theme/img/buddy.png')}
          resizeMode={'cover'}
          style={s.modelImageFront}
        />
        <View style={[s.background, { backgroundColor: primaryColor, borderColor: accent1Color }]}>
          <View style={s.textContainer}>
            <Text style={[s.title, { color: accent1Color }]}>{model.name}</Text>
            <Text
              style={[
                s.text,
                { color: accent1Color },
              ]}>{`${model.statistics.totalEvents} Flights`}</Text>
            <Text style={[s.text, { color: accent1Color }]}>{`${totalTime} Total Time`}</Text>
            {lastFlight && <Text style={s.text}>{`${lastFlight} Last Flight`}</Text>}
          </View>
          <View style={s.attributesContainer}>
            <View
              style={[
                s.modelIconContainer,
                { backgroundColor: accent2Color, borderColor: accent1Color },
              ]}>
              <SvgXml
                xml={getColoredSvg(model.type.toLocaleLowerCase())}
                width={69}
                height={69}
                color={primaryColor}
                style={s.modelIcon}
              />
            </View>
            <View style={[s.attributeIconContainer, { borderColor: accent1Color }]}>
              <Icon
                name={model.logsFuel ? 'gas-pump' : 'battery-full'}
                size={20}
                style={[
                  s.attributeIcon,
                  { color: accent2Color },
                  model.logsFuel ? s.fuelIcon : s.batteryIcon,
                ]}
              />
            </View>
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
          </View>
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
    borderWidth: 2.9,
    marginTop: 9,
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
  modelIconContainer: {
    width: 62,
    height: 62,
    borderColor: theme.colors.darkGray,
    borderWidth: 5.5,
    borderRadius: 50,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelIcon: {
    top: 1,
    transform: [{ rotate: '-30deg' }],
  },
  modelImageFront: {
    width: '100%',
    height: '100%',
  },
  fuelIcon: {
    left: 2,
  },
  batteryIcon: {
    transform: [{ rotate: '-90deg' }],
  },
}));
