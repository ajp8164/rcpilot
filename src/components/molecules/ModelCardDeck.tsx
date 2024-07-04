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

interface ModelCardDeckInterface {
  models: Model[] | Realm.Results<Model>;
}

export const ModelCardDeck = ({ models }: ModelCardDeckInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const tabBarHeight = useBottomTabBarHeight();
  const headerBarLargeHeight = theme.styles.headerBarLarge.height as number;
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : theme.insets.top;
  const visibleViewHeight = viewport.height - tabBarHeight - headerBarLargeHeight - statusBarHeight;

  return (
    <Carousel
      style={s.carousel}
      width={viewport.width * 0.85}
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
        stackInterval: 15,
        rotateZDeg: 10,
      }}
      customConfig={() => ({ type: 'negative', viewCount: models.length > 3 ? 3 : models.length })}
      renderItem={({ item: model, index }: CarouselRenderItemInfo<Model>) => {
        return <ModelFlipCard key={index} model={model} />;
      }}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  carousel: {
    width: '100%',
    justifyContent: 'center',
    marginTop:
      Number(theme.styles.headerBarLarge.height) +
      (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : theme.insets.top),
  },
}));
