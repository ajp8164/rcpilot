import { AppTheme, useTheme } from 'theme';
import React from 'react';

import { makeStyles } from '@rneui/themed';
import { Model } from 'realmdb';
import FlipCardView from 'components/views/FlipCardView';
import { Front as DinnFront } from 'components/molecules/card-deck/dinn/Front';
import { Back as DinnBack } from 'components/molecules/card-deck/dinn/Back';

interface ModelCardDeckCardInterface {
  model: Model;
}

export const ModelFlipCard = ({ model }: ModelCardDeckCardInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <FlipCardView
      cardStyle={s.flipCardContainer}
      FrontContent={<DinnFront model={model} />}
      BackContent={<DinnBack model={model} />}
    />
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  flipCardContainer: {
    marginTop: '10%',
    height: '90%',
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
}));
