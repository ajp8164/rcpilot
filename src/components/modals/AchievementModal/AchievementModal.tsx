import { Achievement, Pilot } from 'realmdb/Pilot';
import { AchievementModalMethods, AchievementModalProps } from './types';
import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem, Text, View } from 'react-native';
import { Modal, ModalHeader } from '@react-native-ajp-elements/ui';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { DateTime } from 'luxon';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Model } from 'realmdb/Model';
import { achievementConfig } from 'lib/achievement';
import { eventKind } from 'lib/modelEvent';
import { makeStyles } from '@rneui/themed';
import { useEvent } from 'lib/event';

type AchievementModal = AchievementModalMethods;

const AchievementModal = React.forwardRef<AchievementModal, AchievementModalProps>((props, ref) => {
  const { headerTitle, onDismiss: _onDismiss, snapPoints = [350] } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  const event = useEvent();
  const [pilot, setPilot] = useState<Pilot>();
  const [model, setModel] = useState<Model>();

  const innerRef = useRef<BottomSheetModalMethods>(null);

  useEffect(() => {
    event.on('achievement-awarded', onAchievementAwarded);
    return () => {
      event.removeListener('achievement-awarded', onAchievementAwarded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {DateTime.fromISO(achievement.date).toFormat('M/dd/yyyy')}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      ref={innerRef}
      snapPoints={snapPoints}
      onDismiss={() => {
        return;
      }}>
      {headerTitle && (
        <ModalHeader
          title={headerTitle}
          rightButtonIcon={'close'}
          size={'small'}
          onRightButtonPress={dismiss}
        />
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
        {pilot?.achievements.length ? (
          <>
            <Text style={s.title}>{`Achievements for ${pilot.name} with ${model?.name}`}</Text>
            <FlatList
              data={pilot.achievements}
              renderItem={renderAchievement}
              horizontal={true}
              keyExtractor={(_item, index) => `${index}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.achievementListContainer}
            />
          </>
        ) : (
          <Text style={s.title}>{`No achievements yet.`}</Text>
        )}
      </View>
    </Modal>
  );
});

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    top: 50,
    margin: 10,
    padding: 10,
    borderRadius: 10,
    height: 200,
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
    top: 50,
    textAlign: 'center',
  },
  achievementContainer: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 5,
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
    width: '100%',
  },
}));

export { AchievementModal };
