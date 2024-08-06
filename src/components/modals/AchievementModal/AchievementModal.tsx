import { Achievement, Pilot } from 'realmdb/Pilot';
import { AchievementModalMethods, AchievementModalProps } from './types';
import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem, Text, View } from 'react-native';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { DateTime } from 'luxon';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Modal } from '@react-native-ajp-elements/ui';
import { Model } from 'realmdb/Model';
import { achievementConfig } from 'lib/achievement';
import { eventKind } from 'lib/modelEvent';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

type AchievementModal = AchievementModalMethods;

const AchievementModal = React.forwardRef<AchievementModal, AchievementModalProps>((props, ref) => {
  const { onDismiss, snapPoints = [290] } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const [pilot, setPilot] = useState<Pilot>();
  const [model, setModel] = useState<Model>();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const innerRef = useRef<BottomSheetModalMethods>(null);

  useEffect(() => {
    event.on('achievement-awarded', onAchievementAwarded);
    return () => {
      event.removeListener('achievement-awarded', onAchievementAwarded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get the list of achievements for the pilot/model combination.
  useEffect(() => {
    const pilotModelAchievements: Achievement[] = [];
    pilot?.achievements.forEach(a => {
      if (a.event.model._id.toString() === model?._id.toString()) {
        pilotModelAchievements.push(a);
      }
    });
    setAchievements(pilotModelAchievements);
  }, [model, pilot]);

  useImperativeHandle(ref, () => ({
    // These functions exposed to the parent component through the ref.
    dismiss,
    present,
  }));

  const dismiss = () => {
    innerRef.current?.dismiss();
  };

  const present = (pilot: Pilot, model: Model) => {
    setPilot(pilot);
    setModel(model);
    innerRef.current?.present();
  };

  const onAchievementAwarded = () => {
    return;
  };

  const renderAchievement: ListRenderItem<Achievement> = ({ item: achievement }) => {
    return (
      <View style={s.achievementContainer}>
        <Icon
          name={achievementConfig[achievement.name].icon}
          color={achievementConfig[achievement.name].iconColor}
          size={60}
        />
        <Text style={s.achievementName}>
          {achievement.name.replace('{Event}', eventKind(model?.type).name)}
        </Text>
        <Text style={s.achievementDate}>
          {DateTime.fromISO(achievement.date).toFormat('M/d/yy')}
        </Text>
      </View>
    );
  };

  return (
    <Modal ref={innerRef} snapPoints={snapPoints} onDismiss={onDismiss}>
      {pilot && (
        <View style={s.header}>
          <View>
            <Text style={s.headerLeft}>{`${pilot.name}`}</Text>
            <Text style={s.headerLeft}>{`${model?.name}`}</Text>
          </View>
          <View>
            <Text style={s.headerRight}>
              {`Since: ${DateTime.fromISO(pilot.createdOn).toFormat('M/d/yy')}`}
            </Text>
          </View>
        </View>
      )}
      <View style={s.container}>
        <View style={s.hero}>
          <Icon
            name={'medal'}
            solid={true}
            color={theme.colors.midGray}
            size={60}
            style={s.heroIcon}
          />
        </View>
        {achievements.length ? (
          <FlatList
            data={achievements}
            renderItem={renderAchievement}
            horizontal={true}
            keyExtractor={(_item, index) => `${index}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.achievementListContainer}
          />
        ) : (
          <Text style={s.title}>{`Waiting for your first achievement`}</Text>
        )}
      </View>
    </Modal>
  );
});

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  header: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 15,
    top: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    ...theme.styles.textSmall,
  },
  headerRight: {
    ...theme.styles.textSmall,
    textAlign: 'right',
  },
  container: {
    top: 50,
    marginVertical: 10,
    paddingBottom: 10,
    height: 165,
    backgroundColor: theme.colors.subtleGray,
  },
  hero: {
    position: 'absolute',
    top: -50,
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 7,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.subtleGray,
    borderColor: theme.colors.white,
  },
  heroIcon: {
    alignSelf: 'center',
    top: 5,
  },
  title: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim,
    width: '100%',
    position: 'absolute',
    top: 80,
    textAlign: 'center',
  },
  achievementContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  achievementName: {
    ...theme.styles.textTiny,
    marginTop: 5,
  },
  achievementDate: {
    ...theme.styles.textTiny,
    ...theme.styles.textDim,
  },
  achievementListContainer: {
    position: 'absolute',
    bottom: 0,
  },
}));

export { AchievementModal };
