import { Image, LayoutChangeEvent, LayoutRectangle, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React, { useRef, useState } from 'react';

import { makeStyles } from '@rneui/themed';
import { Model } from 'realmdb';
import { Button } from '@rneui/base';
import type FlipCardView from 'components/views/FlipCardView';
import { ListItem } from 'components/atoms/List';
import Icon from 'react-native-vector-icons/FontAwesome6';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { DeckCardPropertiesModal } from 'components/modals/DeckCardPropertiesModal';
import { useDispatch, useSelector } from 'react-redux';
import { selectModelPreferences } from 'store/selectors/appSettingsSelectors';
import { defaultDinnCardColors } from './index';
import { DeckCardColors } from 'types/preferences';
import { saveModelPreferences } from 'store/slices/appSettings';
import { SvgXml } from 'react-native-svg';
import { getColoredSvg } from '@react-native-ajp-elements/ui';
import { modelTypeIcons } from 'lib/model';

interface DinnCardInterface extends FlipCardView {
  model: Model;
  onPressEditModel?: () => void;
  onPressNewEventSequence?: () => void;
}

export const Back = ({
  flip,
  model,
  onPressEditModel,
  onPressNewEventSequence,
}: DinnCardInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const dispatch = useDispatch();

  const [cardLayout, setCardLayout] = useState<LayoutRectangle>();
  const deckCardPropertiesModalRef = useRef<DeckCardPropertiesModal>(null);
  const modelPreferences = useSelector(selectModelPreferences(model._id.toString()));

  const cardColors = modelPreferences?.deckCardColors || defaultDinnCardColors;

  const onLayout = (event: LayoutChangeEvent) => {
    setCardLayout(event.nativeEvent.layout);
  };

  const onChangeColors = (colors: DeckCardColors) => {
    dispatch(
      saveModelPreferences({
        modelId: model._id.toString(),
        props: {
          ...modelPreferences,
          deckCardColors: colors,
        },
      }),
    );
  };

  return (
    <>
      <View style={[s.container, { backgroundColor: cardColors.primary }]} onLayout={onLayout}>
        <Text style={[s.title, { color: cardColors.accent1 }]}>{model.name}</Text>
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
              color={theme.colors.brandSecondary}
              style={{
                transform: [{ rotate: '-45deg' }],
              }}
            />
          )}
        </View>
        <View style={s.actions}>
          <ListItem
            title={'New Flight'}
            titleStyle={{ color: cardColors.accent1 }}
            containerStyle={{
              backgroundColor: cardColors.accent2,
            }}
            bottomDividerColor={cardColors.accent1}
            rightImage={<Icon name={'play-circle'} size={20} color={cardColors.accent1} />}
            position={['first']}
            onPress={onPressNewEventSequence}
          />
          <ListItem
            title={'Model Details'}
            titleStyle={{ color: cardColors.accent1 }}
            containerStyle={{
              backgroundColor: cardColors.accent2,
            }}
            rightImage={<CustomIcon name={'circle-info'} size={20} color={cardColors.accent1} />}
            position={['last']}
            onPress={onPressEditModel}
          />
        </View>
        <View style={s.toolbar}>
          <View style={s.toolbarRow}>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              icon={
                <Icon name={'palette'} style={[s.toolbarIcon, { color: cardColors.accent1 }]} />
              }
              onPress={() => {
                flip && flip();
                deckCardPropertiesModalRef.current?.present();
              }}
            />
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              icon={<Icon name={'rotate'} style={[s.toolbarIcon, { color: cardColors.accent1 }]} />}
              onPress={flip && flip}
            />
          </View>
        </View>
      </View>
      <DeckCardPropertiesModal
        ref={deckCardPropertiesModalRef}
        colors={cardColors}
        onChangeColors={onChangeColors}
      />
    </>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    height: '100%',
    backgroundColor: theme.colors.stickyWhite,
    padding: 15,
  },
  title: {
    ...theme.styles.textHeading2,
  },
  image: {
    position: 'absolute',
    right: 0,
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
