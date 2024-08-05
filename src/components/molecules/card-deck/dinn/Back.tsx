import { Image, LayoutChangeEvent, LayoutRectangle, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React, { useState } from 'react';

import { makeStyles } from '@rneui/themed';
import { Model } from 'realmdb';
import { Button } from '@rneui/base';
import type FlipCardView from 'components/views/FlipCardView';
import { ListItem } from 'components/atoms/List';
import Icon from 'react-native-vector-icons/FontAwesome6';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { SvgXml } from 'react-native-svg';
import { getColoredSvg } from '@react-native-ajp-elements/ui';
import { modelTypeIcons } from 'lib/model';

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
  const s = useStyles(theme);

  const [cardLayout, setCardLayout] = useState<LayoutRectangle>();

  const onLayout = (event: LayoutChangeEvent) => {
    setCardLayout(event.nativeEvent.layout);
  };

  return (
    <>
      <View style={s.container} onLayout={onLayout}>
        <Text style={s.title}>{model.name}</Text>
        <View style={s.image}>
          {model.image ? (
            <Image
              source={{ uri: model.image }}
              resizeMode={'cover'}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                width: cardLayout ? cardLayout.width * 0.33 : 0,
                height: cardLayout ? cardLayout?.width * 0.33 : 0,
              }}
            />
          ) : (
            <SvgXml
              xml={getColoredSvg(modelTypeIcons[model.type]?.name as string)}
              width={cardLayout ? cardLayout.width * 0.33 : 0}
              height={cardLayout ? cardLayout?.width * 0.33 : 0}
              color={theme.colors.whiteTransparentDark}
              style={{
                transform: [{ rotate: '-45deg' }],
              }}
            />
          )}
        </View>
        <View style={s.actions}>
          <ListItem
            title={'New Flight'}
            titleStyle={s.listItemText}
            containerStyle={{
              backgroundColor: theme.colors.whiteTransparentDark,
            }}
            bottomDividerColor={theme.colors.darkGray}
            rightImage={<Icon name={'play-circle'} size={20} color={theme.colors.darkGray} />}
            position={['first']}
            onPress={onPressNewEventSequence}
          />
          <ListItem
            title={'Model Details'}
            titleStyle={s.listItemText}
            containerStyle={{
              backgroundColor: theme.colors.whiteTransparentDark,
            }}
            rightImage={<CustomIcon name={'circle-info'} size={20} color={theme.colors.darkGray} />}
            position={['last']}
            onPress={onPressEditModel}
          />
        </View>
        <View style={s.toolbar}>
          <View style={s.toolbarRow}>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              icon={
                <Icon
                  name={'palette'}
                  style={[s.toolbarIcon, { color: theme.colors.whiteTransparentDark }]}
                />
              }
              onPress={() => {
                flip && flip();
                onPressEditCardProperties && onPressEditCardProperties();
              }}
            />
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              icon={
                <Icon
                  name={'rotate'}
                  style={[s.toolbarIcon, { color: theme.colors.whiteTransparentDark }]}
                />
              }
              onPress={flip && flip}
            />
          </View>
        </View>
      </View>
    </>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    height: '100%',
    backgroundColor: theme.colors.darkGray,
    padding: 15,
  },
  title: {
    ...theme.styles.textHeading2,
    color: theme.colors.whiteTransparentDark,
  },
  image: {
    position: 'absolute',
    right: 0,
  },
  listItemText: {
    color: theme.colors.darkGray,
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
  toolbarIcon: {
    fontSize: 22,
    marginHorizontal: 10,
  },
}));
