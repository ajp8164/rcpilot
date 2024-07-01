import { Image, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { makeStyles } from '@rneui/themed';
import { getColoredSvg } from '@react-native-ajp-elements/ui';
import { Model } from 'realmdb';
import { modelMaintenanceIsDue, modelTypeIcons } from 'lib/model';
import { SvgXml } from 'react-native-svg';
import { FlipCard } from 'components/atoms/FlipCard';

interface ModelCardDeckCardInterface {
  model: Model;
}

export const ModelFlipCard = ({ model }: ModelCardDeckCardInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const maintenanceIsDue = modelMaintenanceIsDue(model);

  const renderFront = () => {
    return (
      <View style={s.cardFrontContainer}>
        <Text style={s.title}>{model.name}</Text>
        <View>
          {model.image ? (
            <Image source={{ uri: model.image }} resizeMode={'cover'} style={s.modelImage} />
          ) : (
            <View style={[{}, s.modelSvgContainer]}>
              <SvgXml
                xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
                width={'100%'}
                height={'100%'}
                color={theme.colors.brandSecondary}
                style={s.modelIcon}
              />
            </View>
          )}
          {(model.damaged || maintenanceIsDue) && (
            <View style={s.modelStatusContainer}>
              {model.damaged && <Icon name={'bandage'} size={32} style={s.modelStatusIcon} />}
              {maintenanceIsDue && <Icon name={'wrench'} size={30} style={s.modelStatusIcon} />}
            </View>
          )}
          <Icon name={'circle-info'} size={32} style={s.modelSettingsIcon} />
        </View>
      </View>
    );
  };

  const renderBack = () => {
    return (
      <View style={s.cardBackContainer}>
        <Text style={s.title}>{model.name}</Text>
        <View>
          <Text>{'Hello'}</Text>
        </View>
      </View>
    );
  };

  return (
    <FlipCard
      frontItem={renderFront()}
      backItem={renderBack()}
      containerProps={{
        style: s.flipCardContainer,
        // onTouchStart: () => {
        //   console.log('pressed');
        // },
      }}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  flipCardContainer: {
    marginTop: '20%',
    height: '80%',
    borderWidth: 2,
    borderColor: theme.colors.subtleGray,
    backgroundColor: 'white',
    borderRadius: 7,
    overflow: 'hidden',
  },
  cardFrontContainer: {
    padding: 20,
    height: '100%',
    width: '100%',
  },
  cardBackContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  modelImage: {
    width: '100%',
    height: '100%',
  },
  modelSettingsIcon: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    color: theme.colors.midGray,
  },
  modelStatusContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    height: 30,
    paddingTop: 1,
  },
  modelStatusIcon: {
    paddingRight: 15,
    left: 15,
    bottom: 15,
    color: theme.colors.midGray,
  },
  modelSvgContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
  title: {
    ...theme.styles.textHeading1,
    position: 'absolute',
    width: '100%',
    marginTop: 20,
    textAlign: 'center',
    alignSelf: 'center',
    zIndex: 1,
  },
}));
