import { AppTheme, useTheme } from 'theme';
import React, { useContext } from 'react';

import { makeStyles } from '@rneui/themed';
import { Model } from 'realmdb';
import FlipCardView from 'components/views/FlipCardView';
import { Back as DinnBack, Front as DinnFront } from 'components/molecules/card-deck/dinn';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ModelsNavigatorParamList } from 'types/navigation';
import { viewport } from '@react-native-ajp-elements/ui';
import { useSharedValue } from 'react-native-reanimated';
import { ModelCardDeckContext } from 'components/molecules/card-deck/ModelCardDeckContext';

interface ModelCardDeckCardInterface {
  model: Model;
  onStartNewEventSequence: (model: Model) => void;
}

export const ModelFlipCard = ({ model, onStartNewEventSequence }: ModelCardDeckCardInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const navigation: NavigationProp<ModelsNavigatorParamList> = useNavigation();
  const { cardState } = useContext(ModelCardDeckContext);
  const sv = useSharedValue(false);

  // Lazy initialization of card state.
  const id = model._id.toString();
  if (!cardState[id]) {
    cardState[id] = {
      isFlipped: sv,
    };
  }

  const editModel = () => {
    navigation.navigate('ModelEditor', {
      modelId: model._id.toString(),
    });
  };

  const onNewEventSequence = () => {
    onStartNewEventSequence(model);
  };

  return (
    <FlipCardView
      isFlipped={cardState[id].isFlipped}
      cardStyle={s.flipCardContainer}
      FrontContent={
        <DinnFront
          model={model}
          onPressEditModel={editModel}
          onPressNewEventSequence={onNewEventSequence}
        />
      }
      BackContent={
        <DinnBack
          model={model}
          onPressEditModel={editModel}
          onPressNewEventSequence={onNewEventSequence}
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
