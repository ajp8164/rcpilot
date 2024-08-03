import { AppTheme, useTheme } from 'theme';
import React, { useContext, useRef } from 'react';

import { makeStyles } from '@rneui/themed';
import { Model } from 'realmdb';
import FlipCardView from 'components/views/FlipCardView';
import {
  Back as DinnBack,
  Front as DinnFront,
  defaultDinnCardColors,
} from 'components/molecules/card-deck/dinn';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ModelsNavigatorParamList } from 'types/navigation';
import { viewport } from '@react-native-ajp-elements/ui';
import { useSharedValue } from 'react-native-reanimated';
import { ModelCardDeckContext } from 'components/molecules/card-deck/ModelCardDeckContext';
import { DeckCardColors } from 'types/preferences';
import { saveModelPreferences } from 'store/slices/appSettings';
import { useDispatch, useSelector } from 'react-redux';
import { selectModelPreferences } from 'store/selectors/appSettingsSelectors';
import { DeckCardPropertiesModal } from 'components/modals/DeckCardPropertiesModal';

interface ModelCardDeckCardInterface {
  model: Model;
  onStartNewEventSequence: (model: Model) => void;
}

export const ModelFlipCard = ({ model, onStartNewEventSequence }: ModelCardDeckCardInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const dispatch = useDispatch();

  const navigation: NavigationProp<ModelsNavigatorParamList> = useNavigation();
  const { cardState } = useContext(ModelCardDeckContext);
  const sv = useSharedValue(false);

  const modelPreferences = useSelector(selectModelPreferences(model._id.toString()));
  const cardPropertiesModalRef = useRef<DeckCardPropertiesModal>(null);

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

  const onNewEventSequence = () => {
    onStartNewEventSequence(model);
  };

  const onEditCardProperties = () => {
    cardPropertiesModalRef.current?.present({
      colors: modelPreferences?.deckCardColors || defaultDinnCardColors,
    });
  };

  // TODO: Hard coded to use Dinn card for now. Should be generalized for using different card designs.
  return (
    <>
      <FlipCardView
        isFlipped={cardState[id].isFlipped}
        cardStyle={s.flipCardContainer}
        FrontContent={
          <DinnFront
            model={model}
            onPressEditModel={editModel}
            onPressNewEventSequence={onNewEventSequence}
            onPressEditCardProperties={onEditCardProperties}
          />
        }
        BackContent={
          <DinnBack
            model={model}
            onPressEditModel={editModel}
            onPressNewEventSequence={onNewEventSequence}
            onPressEditCardProperties={onEditCardProperties}
          />
        }
      />
      <DeckCardPropertiesModal ref={cardPropertiesModalRef} onChangeColors={onChangeColors} />
    </>
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
