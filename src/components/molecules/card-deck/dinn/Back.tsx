import React, { useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  LayoutRectangle,
  Text,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ellipsis } from '@react-native-hello/core';
import {
  ListItem,
  ThemeManager,
  getColoredSvg,
  useTheme,
} from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import type FlipCardView from 'components/views/FlipCardView';
import { secondsToFormat } from 'lib/formatters';
import { modelTypeIconProps } from 'lib/model';
import { eventKind } from 'lib/modelEvent';
import {
  Info,
  Palette,
  PlayCircle,
  RotateCcwSquare,
} from 'lucide-react-native';
import { DateTime } from 'luxon';
import { Model } from 'realmdb';

interface DinnCardInterface extends FlipCardView {
  model: Model;
  onPressEditCardProperties?: () => void;
  onPressEditModel?: () => void;
  onPressNewEventSequence?: () => void;
}

export const Back = ({
  flip,
  model,
  onPressEditCardProperties,
  onPressEditModel,
  onPressNewEventSequence,
}: DinnCardInterface) => {
  const theme = useTheme();
  const s = useStyles();

  const [cardLayout, setCardLayout] = useState<LayoutRectangle>();

  const onLayout = (event: LayoutChangeEvent) => {
    setCardLayout(event.nativeEvent.layout);
  };

  return (
    <>
      <View style={s.container} onLayout={onLayout}>
        <Text style={s.title}>{ellipsis(model.name, 20)}</Text>
        <View style={s.image}>
          {model.image ? (
            <Image
              source={{ uri: model.image }}
              resizeMode={'cover'}
              style={{
                width: cardLayout ? cardLayout.width - 30 : 0,
                height: cardLayout ? cardLayout?.width * 0.33 : 0,
                borderRadius: 10,
              }}
            />
          ) : (
            <SvgXml
              xml={getColoredSvg(modelTypeIconProps[model.type]?.name)}
              width={cardLayout ? cardLayout.width * 0.33 : 0}
              height={cardLayout ? cardLayout?.width * 0.33 : 0}
              color={theme.colors.midGray}
              style={{
                transform: [{ rotate: '-45deg' }],
              }}
            />
          )}
        </View>
        <Text style={s.subtitle}>{'STATISTICS'}</Text>
        <View style={s.statRow}>
          <Text style={s.text}>{`Last ${eventKind(model.type).name}`}</Text>
          <Text style={s.text}>
            {model.lastEvent
              ? DateTime.fromISO(model.lastEvent).toFormat(
                  "MMM d, yyyy 'at' h:mm a",
                )
              : model.events.length
                ? 'Unknown'
                : 'N/A'}
          </Text>
        </View>
        <View style={s.statRow}>
          <Text
            style={
              s.text
            }>{`Number of ${eventKind(model.type).namePlural}`}</Text>
          <Text style={s.text}>{model?.statistics.totalEvents}</Text>
        </View>
        <View style={s.statRow}>
          <Text style={s.text}>{'Total Time'}</Text>
          <Text style={s.text}>
            {secondsToFormat(model?.statistics.totalTime, {
              format: "h'h' m'm' s's'",
            })}
          </Text>
        </View>
        <View style={s.actions}>
          <ListItem
            title={'New Flight'}
            titleStyle={s.listItemText}
            containerStyle={{
              backgroundColor: theme.colors.deckCardDinnBackListItem,
            }}
            bottomDividerColor={theme.colors.darkGray}
            rightContent={<PlayCircle color={theme.colors.midGray} size={33} />}
            position={['first']}
            onPress={onPressNewEventSequence}
          />
          <ListItem
            title={'Model Details'}
            titleStyle={s.listItemText}
            containerStyle={{
              backgroundColor: theme.colors.deckCardDinnBackListItem,
            }}
            rightContent={<Info color={theme.colors.midGray} size={33} />}
            position={['last']}
            onPress={onPressEditModel}
          />
        </View>
        <View style={s.toolbar}>
          <View style={s.toolbarRow}>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              icon={
                <Palette color={theme.colors.deckCardDinnBackIcon} size={33} />
              }
              onPress={() => {
                flip?.();
                onPressEditCardProperties?.();
              }}
            />
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              icon={
                <RotateCcwSquare
                  color={theme.colors.deckCardDinnBackIcon}
                  size={33}
                />
              }
              onPress={() => flip?.()}
            />
          </View>
        </View>
      </View>
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    height: '100%',
    backgroundColor: theme.colors.deckCardDinnBack,
    padding: 15,
  },
  title: {
    ...theme.text.h2,
    // color: theme.colors.lightGray,
    color: theme.colors.deckCardDinnBackText,
  },
  subtitle: {
    ...theme.text.small,
    marginTop: 15,
    marginBottom: 5,
    // color: theme.colors.lightGray,
    color: theme.colors.deckCardDinnBackText,
  },
  text: {
    ...theme.text.normal,
    // color: theme.colors.lightGray,
    color: theme.colors.deckCardDinnBackText,
    lineHeight: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  image: {},
  listItemText: {
    // color: theme.colors.midGray,
    color: theme.colors.deckCardDinnBackText,
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  toolbar: {
    justifyContent: 'flex-end',
  },
  toolbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
}));
