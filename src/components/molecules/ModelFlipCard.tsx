import { AppTheme, useTheme } from 'theme';
import React from 'react';

import { makeStyles } from '@rneui/themed';
import { Model } from 'realmdb';
import FlipCardView from 'components/views/FlipCardView';
import { Back as DinnBack, Front as DinnFront } from 'components/molecules/card-deck/dinn';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ModelsNavigatorParamList } from 'types/navigation';
import { viewport } from '@react-native-ajp-elements/ui';

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
    alignSelf: 'center',
    height: (viewport.width - 30) / 0.61,
    width: viewport.width - 30,
    marginTop: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
}));
