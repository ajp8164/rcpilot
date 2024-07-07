import { AppTheme, useTheme } from 'theme';
import React from 'react';

import { makeStyles } from '@rneui/themed';
import { Model } from 'realmdb';
import FlipCardView from 'components/views/FlipCardView';
import { Back as DinnBack, Front as DinnFront } from 'components/molecules/card-deck/dinn';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ModelsNavigatorParamList } from 'types/navigation';

interface ModelCardDeckCardInterface {
  model: Model;
  startNewEventSequence: (model: Model) => void;
}

export const ModelFlipCard = ({ model, startNewEventSequence }: ModelCardDeckCardInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const navigation: NavigationProp<ModelsNavigatorParamList> = useNavigation();

  const editModel = () => {
    navigation.navigate('ModelEditor', {
      modelId: model._id.toString(),
    });
  };

  const newEventSequence = () => {
    startNewEventSequence(model);
  };

  return (
    <FlipCardView
      cardStyle={s.flipCardContainer}
      FrontContent={
        <DinnFront
          model={model}
          onPressEditModel={editModel}
          onPressNewEventSequence={newEventSequence}
        />
      }
      BackContent={
        <DinnBack
          model={model}
          onPressEditModel={editModel}
          onPressNewEventSequence={newEventSequence}
        />
      }
    />
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  flipCardContainer: {
    marginTop: '7%',
    height: '93%',
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
}));
