import { Image, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { makeStyles } from '@rneui/themed';
import { getColoredSvg } from '@react-native-ajp-elements/ui';
import { Model, Pilot } from 'realmdb';
import { modelMaintenanceIsDue, modelTypeIcons } from 'lib/model';
import { SvgXml } from 'react-native-svg';
import { Button } from '@rneui/base';
import { eventKind } from 'lib/modelEvent';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { secondsToMSS } from 'lib/formatters';
import { DateTime } from 'luxon';

interface ModelPostCardInterface {
  model: Model;
  onPressAchievements: (pilot: Pilot, model: Model) => void;
  onPressEditModel: (model: Model) => void;
  onPressNewEvent: (model: Model) => void;
  pilot?: Pilot;
}

export const ModelPostCard = ({
  model,
  onPressEditModel,
  onPressNewEvent,
  onPressAchievements,
  pilot,
}: ModelPostCardInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const maintenanceIsDue = modelMaintenanceIsDue(model);

  return (
    <View style={s.modelCard}>
      <View style={s.modelCardHeader}>
        {pilot && (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={
              <Icon
                name={'certificate'}
                color={theme.colors.subtleGray}
                size={30}
                style={s.achievementButtonIcon}
              />
            }
            titleStyle={s.achievementButtonTitle}
            title={pilot ? `${pilot.achievements.length}` : '0'}
            onPress={() => onPressAchievements(pilot, model)}
          />
        )}
        <View style={s.modelCardHeaderTextContainer}>
          <View style={s.modelCardTitleContainer}>
            <Text style={s.modelCardTitleLeft}>{model.name}</Text>
            <Text style={s.modelCardTitleRight}>
              {model.lastEvent
                ? `Last ${DateTime.fromISO(model.lastEvent).toFormat('M/d/yyyy')}`
                : `No ${eventKind(model.type).namePlural}`}
            </Text>
          </View>
          <View style={s.modelCardSubtitleContainer}>
            <Text style={s.modelCardSubtitle}>
              {`${model.statistics.totalEvents || 0} ${eventKind(model.type).namePlural.toLowerCase()}`}
            </Text>
            <Text style={s.modelCardSubtitle}>
              {`${secondsToMSS(model.statistics.totalTime, { format: 'm:ss' })} total time`}
            </Text>
          </View>
        </View>
      </View>
      {model.image ? (
        <Image source={{ uri: model.image }} resizeMode={'cover'} style={s.modelCardImage} />
      ) : (
        <View style={s.modelCardSvg}>
          <SvgXml
            xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
            width={s.modelImage.width}
            height={'100%'}
            color={theme.colors.brandSecondary}
            style={s.modelIcon}
          />
        </View>
      )}
      {(model.damaged || maintenanceIsDue) && (
        <View style={s.modelTagContainer}>
          {model.damaged && <Text style={s.modelTag}>{'Damaged'}</Text>}
          {maintenanceIsDue && <Text style={s.modelTag}>{'Maintenance Due'}</Text>}
        </View>
      )}
      <View style={s.modelCardFooter}>
        <Button
          title={'Details'}
          titleStyle={s.modelCardButtonTitle}
          buttonStyle={s.modelCardButton}
          icon={
            <CustomIcon
              name={'circle-info'}
              size={20}
              color={theme.colors.clearButtonText}
              style={s.modelCardButtonIcon}
            />
          }
          onPress={() => onPressEditModel(model)}
        />
        <Button
          title={`New ${eventKind(model.type).name}`}
          titleStyle={s.modelCardButtonTitle}
          buttonStyle={s.modelCardButton}
          icon={
            <Icon
              name={'circle-play'}
              size={20}
              color={theme.colors.clearButtonText}
              style={s.modelCardButtonIcon}
            />
          }
          onPress={() => onPressNewEvent(model)}
        />
      </View>
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  achievementButtonIcon: {
    top: -2,
    height: 30,
  },
  achievementButtonTitle: {
    ...theme.styles.textTiny,
    ...theme.styles.textBold,
    marginLeft: -30,
    color: theme.colors.lightGray,
    top: -2,
    marginRight: 10,
    borderWidth: 0,
    width: 30,
  },
  modelCard: {
    width: '100%',
    paddingVertical: 10,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: theme.colors.listItem,
  },
  modelCardHeader: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    paddingHorizontal: 15,
  },
  modelCardHeaderTextContainer: {
    flex: 1,
  },
  modelCardTitleLeft: {
    ...theme.styles.textNormal,
    ...theme.styles.textBold,
  },
  modelCardTitleRight: {
    ...theme.styles.textSmall,
    flex: 1,
    top: 2,
    textAlign: 'right',
  },
  modelCardTitleContainer: {
    flexDirection: 'row',
  },
  modelCardSubtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modelCardSubtitle: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim,
    paddingBottom: 5,
  },
  modelCardImage: {
    flex: 1,
    minHeight: 132,
  },
  modelCardSvg: {
    flex: 1,
    minHeight: 132,
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
  modelCardFooter: {
    flexDirection: 'row',
    height: 48,
    paddingTop: 10,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelCardButtonTitle: {
    ...theme.styles.buttonScreenHeaderTitle,
    ...theme.styles.textSmall,
    ...theme.styles.textBold,
    color: theme.colors.clearButtonText,
  },
  modelCardButton: {
    ...theme.styles.buttonScreenHeader,
  },
  modelCardButtonIcon: {
    paddingRight: 5,
  },
  modelIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  modelImage: {
    width: 150,
    height: 85,
  },
  modelTagContainer: {
    flexDirection: 'row',
    padding: 5,
    paddingTop: 10,
    marginHorizontal: 10,
  },
  modelTag: {
    ...theme.styles.textTiny,
    ...theme.styles.textBold,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginRight: 5,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
    backgroundColor: theme.colors.lightGray,
    color: theme.colors.stickyWhite,
  },
}));
