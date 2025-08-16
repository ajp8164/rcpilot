import { ThemeManager, getColoredSvg, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { secondsToFormat } from 'lib/formatters';
import { modelMaintenanceIsDue, modelTypeIconProps } from 'lib/model';
import { eventKind } from 'lib/modelEvent';
import { CirclePlay, Info, Trophy } from 'lucide-react-native';
import { DateTime } from 'luxon';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Model, Pilot } from 'realmdb';

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
  const s = useStyles();

  const maintenanceIsDue = modelMaintenanceIsDue(model);

  return (
    <View style={s.modelCard}>
      <View style={s.modelCardHeader}>
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
              {`${secondsToFormat(model.statistics.totalTime, { format: "h'h' m'm'" })} total time`}
            </Text>
          </View>
        </View>
      </View>
      {model.image ? (
        <Image
          source={{ uri: model.image }}
          resizeMode={'cover'}
          style={s.modelCardImage}
        />
      ) : (
        <View style={s.modelCardSvg}>
          <SvgXml
            xml={getColoredSvg(modelTypeIconProps[model.type]?.name)}
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
          {maintenanceIsDue && (
            <Text style={s.modelTag}>{'Maintenance Due'}</Text>
          )}
        </View>
      )}
      <View style={s.modelCardFooter}>
        {pilot && (
          <Button
            buttonStyle={s.modelCardButton}
            icon={<Trophy color={theme.colors.clearButtonText} size={33} />}
            onPress={() => onPressAchievements(pilot, model)}
          />
        )}
        <Button
          buttonStyle={s.modelCardButton}
          icon={<Info color={theme.colors.clearButtonText} size={33} />}
          onPress={() => onPressEditModel(model)}
        />
        <Button
          buttonStyle={s.modelCardButton}
          icon={<CirclePlay color={theme.colors.clearButtonText} size={33} />}
          onPress={() => onPressNewEvent(model)}
        />
      </View>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  achievementButtonTitle: {
    ...theme.text.tiny,
    fontFamily: theme.fonts.bold,
    marginLeft: -30,
    color: theme.colors.stickyWhite,
    width: 30,
  },
  modelCardButton: {
    ...theme.styles.buttonScreenHeader,
    justifyContent: 'center',
    alignSelf: 'center',
    width: 50,
  },
  modelCard: {
    width: '100%',
    paddingVertical: 10,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: theme.colors.listItem,
  },
  modelCardFooter: {
    flexDirection: 'row',
    height: 48,
    paddingTop: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
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
    ...theme.text.normal,
    fontFamily: theme.fonts.bold,
  },
  modelCardTitleRight: {
    ...theme.text.small,
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
    ...theme.text.small,
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
    ...theme.text.tiny,
    fontFamily: theme.fonts.bold,
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
