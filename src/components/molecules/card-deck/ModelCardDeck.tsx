import { Platform, StatusBar } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React from 'react';

import { makeStyles } from '@rneui/themed';
import { viewport } from '@react-native-ajp-elements/ui';
import Carousel from 'react-native-reanimated-carousel';
import { Model } from 'realmdb';
import { CarouselRenderItemInfo } from 'react-native-reanimated-carousel/lib/typescript/types';
import { Realm } from '@realm/react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ModelFlipCard } from 'components/molecules/ModelFlipCard';
import { ModelCardDeckProvider } from './ModelCardDeckProvider';

interface ModelCardDeckInterface {
  models: Model[] | Realm.Results<Model>;
  onStartNewEventSequence: (model: Model) => void;
}
export const ModelCardDeck = ({ models, onStartNewEventSequence }: ModelCardDeckInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const tabBarHeight = useBottomTabBarHeight();
  const headerBarLargeHeight = theme.styles.headerBarLarge.height as number;
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : theme.insets.top;
  const visibleViewHeight = viewport.height - tabBarHeight - headerBarLargeHeight - statusBarHeight;

  // The ModelCardDeckProvider manages card state outside of the carousel. When the carousel
  // has less than 3 cards it auto fills (see carousel autoFillData) the list so that at least
  // three cards are in the data collection. This causes a problem for cards that may otherwise
  // manage their own state (like isFlipped). Duplcation of cards by the carousel creates new
  // instances with their own state. The context provides shared state for the duplicated cards
  // in the carousel.
  return (
    <ModelCardDeckProvider>
      <Carousel
        style={s.carousel}
        width={viewport.width}
        height={visibleViewHeight}
        pagingEnabled={true}
        snapEnabled={true}
        mode={'horizontal-stack'}
        loop={true}
        autoPlay={false}
        autoPlayReverse={false}
        data={[...models]}
        modeConfig={{
          moveSize: viewport.width * 2,
          snapDirection: 'left',
          stackInterval: 0,
          rotateZDeg: 10,
        }}
        customConfig={() => ({ type: 'negative' })}
        renderItem={({ item: model, index }: CarouselRenderItemInfo<Model>) => {
          return (
            <ModelFlipCard
              key={index}
              model={model}
              onStartNewEventSequence={onStartNewEventSequence}
            />
          );
        }}
      />
    </ModelCardDeckProvider>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  carousel: {
    justifyContent: 'center',
    marginTop:
      Number(theme.styles.headerBarLarge.height) +
      (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : theme.insets.top),
  },
}));
