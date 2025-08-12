import { viewport } from '@react-native-hello/ui';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Realm } from '@realm/react';
import { makeStyles } from '@rn-vui/themed';
import { DeckCardPropertiesModal } from 'components/modals/DeckCardPropertiesModal';
import { ModelFlipCard } from 'components/molecules/ModelFlipCard';
import React, { useRef } from 'react';
import { Platform, StatusBar } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { CarouselRenderItemInfo } from 'react-native-reanimated-carousel/lib/typescript/types';
import { Model, Pilot } from 'realmdb';
import { AppTheme, useTheme } from 'theme';

import { ModelCardDeckProvider } from './ModelCardDeckProvider';

interface ModelCardDeckInterface {
  models: Model[] | Realm.Results<Model>;
  pilot?: Pilot;
  onPressAchievements: (pilot: Pilot, model: Model) => void;
  onStartNewEventSequence: (model: Model) => void;
}
export const ModelCardDeck = ({
  models,
  pilot,
  onPressAchievements,
  onStartNewEventSequence,
}: ModelCardDeckInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const cardPropertiesModalRef = useRef<DeckCardPropertiesModal>(null);

  const tabBarHeight = useBottomTabBarHeight();
  const headerBarLargeHeight = theme.styles.headerBarLarge.height as number;
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : theme.insets.top;
  const visibleViewHeight =
    viewport.height - tabBarHeight - headerBarLargeHeight - statusBarHeight;

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
        windowSize={3} // Render performance
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
        renderItem={({ item: model, index }: CarouselRenderItemInfo<Model>) => (
          <ModelFlipCard
            key={index}
            model={model}
            pilot={pilot}
            propertiesModal={cardPropertiesModalRef}
            onPressAchievements={onPressAchievements}
            onStartNewEventSequence={onStartNewEventSequence}
          />
        )}
      />
      <DeckCardPropertiesModal ref={cardPropertiesModalRef} />
    </ModelCardDeckProvider>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  carousel: {
    justifyContent: 'center',
    marginTop:
      Number(theme.styles.headerBarLarge?.height || 20) +
      (Platform.OS === 'android'
        ? StatusBar.currentHeight || 0
        : theme.insets.top),
  },
}));
