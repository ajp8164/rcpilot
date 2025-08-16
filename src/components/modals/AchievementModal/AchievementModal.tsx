import { AchievementModalMethods, AchievementModalProps } from './types';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, ThemeManager, useTheme } from '@react-native-hello/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { achievementConfig } from 'lib/achievement';
import { useEvent } from 'lib/event';
import { eventKind } from 'lib/modelEvent';
import { Trophy } from 'lucide-react-native';
import { DateTime } from 'luxon';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FlatList, ListRenderItem, Text, View } from 'react-native';
import { Model } from 'realmdb/Model';
import { Achievement, Pilot } from 'realmdb/Pilot';

type AchievementModal = AchievementModalMethods;

const AchievementModal = React.forwardRef<
  AchievementModal,
  AchievementModalProps
>((props, ref) => {
  const { onDismiss, snapPoints = ['92%'] } = props;

  const theme = useTheme();
  const s = useStyles();
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

  const renderAchievement: ListRenderItem<Achievement> = ({
    item: achievement,
  }) => {
    return (
      <View style={s.achievementContainer}>
        {achievementConfig[achievement.name].icon}
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
          <Trophy color={theme.colors.midGray} size={60} style={s.heroIcon} />
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
          <EmptyView
            info
            message={'No Achievement'}
            details={'Waiting for your first achievement.'}
          />
        )}
      </View>
    </Modal>
  );
});

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  header: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 15,
    top: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    ...theme.text.medium,
  },
  headerRight: {
    ...theme.text.medium,
    textAlign: 'right',
  },
  container: {
    top: 50,
    marginVertical: 10,
    paddingBottom: 10,
    backgroundColor: theme.colors.viewBackground,
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
    backgroundColor: theme.colors.viewBackground,
    borderColor: theme.colors.viewAltBackground,
  },
  heroIcon: {
    alignSelf: 'center',
    top: 5,
  },
  title: {
    ...theme.text.small,
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
    ...theme.text.tiny,
    marginTop: 5,
  },
  achievementDate: {
    ...theme.text.tiny,
    ...theme.styles.textDim,
  },
  achievementListContainer: {
    position: 'absolute',
    bottom: 0,
  },
}));

export { AchievementModal };
