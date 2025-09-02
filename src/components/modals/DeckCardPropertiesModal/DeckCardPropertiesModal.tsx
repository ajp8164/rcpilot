import React, {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, ModalHeader, ThemeManager } from '@react-native-hello/ui';
import { BackdropContext } from 'components/atoms/Backdrop';
import IconCloseX from 'components/atoms/IconCloseX';
import { ColorPickerContext, Result } from 'components/modals/ColorPickerModal';
import { defaultDinnCardColors } from 'components/molecules/card-deck/dinn';
import { store } from 'store';
import { saveModelPreferences } from 'store/slices/appSettings';
import { DeckCardColors } from 'types/preferences';

import {
  DeckCardPropertiesModalMethods,
  DeckCardPropertiesModalProps,
} from './types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DeckCardPropertiesModal = DeckCardPropertiesModalMethods;

const DeckCardPropertiesModal = React.forwardRef<
  DeckCardPropertiesModal,
  DeckCardPropertiesModalProps
>((props, ref) => {
  const { snapPoints = [200] } = props;

  const s = useStyles();
  const dispatch = useDispatch();

  const innerRef = useRef<BottomSheetModalMethods>(null);
  const backdrop = useContext(BackdropContext);
  const colorPicker = useContext(ColorPickerContext);

  // Create state for returning result. The shared values cannot be returned to the caller.
  const sharedPrimary = useSharedValue('#000000'); // Any valid color, overwritten in present()
  const sharedAccent1 = useSharedValue('#000000');
  const sharedAccent2 = useSharedValue('#000000');

  const [deckCardColors, setDeckCardColors] = useState<DeckCardColors>({
    primary: '#000000',
    accent1: '#000000',
    accent2: '#000000',
  });

  const primaryStyle = useAnimatedStyle(() => {
    return { backgroundColor: sharedPrimary.value };
  });
  const accent1Style = useAnimatedStyle(() => {
    return { backgroundColor: sharedAccent1.value };
  });
  const accent2Style = useAnimatedStyle(() => {
    return { backgroundColor: sharedAccent2.value };
  });

  useEffect(() => {
    setDeckCardColors({
      primary: sharedPrimary.value,
      accent1: sharedAccent1.value,
      accent2: sharedAccent2.value,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    // These functions exposed to the parent component through the ref.
    dismiss,
    present,
  }));

  const dismiss = () => {
    innerRef.current?.dismiss();
    backdrop.setEnabled(false);
  };

  const [modelId, setModelId] = useState<string>();

  const present = (modelId: string) => {
    setModelId(modelId);
    const modelPreferences =
      store.getState().appSettings.modelsPreferences[modelId];

    const colors = modelPreferences?.deckCardColors || defaultDinnCardColors;
    setDeckCardColors(colors);
    sharedPrimary.value = colors.primary;
    sharedAccent1.value = colors.accent1;
    sharedAccent2.value = colors.accent2;

    innerRef.current?.present();

    // Backdrop prevents touches while this modal is presented. Cannot use the bottomsheet modal
    // backdrop because the color picker eyedropper would be behind the bottomsheet modal backdrop
    // and not useable.
    backdrop.setEnabled(true);
  };

  colorPicker.onDismiss = (result: Result) => {
    const updated = {
      ...deckCardColors,
      [result.extraData.name]: result.color,
    };
    setDeckCardColors(updated);
    onChangeColors(updated);

    setTimeout(() => {
      innerRef.current?.present();
    }, 100);
  };

  const onChangeColors = (colors: DeckCardColors) => {
    if (!modelId) return;
    const modelPreferences =
      store.getState().appSettings.modelsPreferences[modelId];
    dispatch(
      saveModelPreferences({
        modelId: modelId,
        props: {
          ...modelPreferences,
          deckCardColors: colors,
        },
      }),
    );
  };

  return (
    <Modal
      ref={innerRef}
      snapPoints={snapPoints}
      enableGestureBehavior={true}
      backdrop={false}
      onDismiss={() => backdrop.setEnabled(false)}>
      <ModalHeader
        size={'small'}
        title={'Card Preferences'}
        rightButtonIcon={<IconCloseX />}
        onRightButtonPress={dismiss}
      />
      <View style={s.container}>
        <View style={s.colorBar}>
          <View style={s.colorContainer}>
            <AnimatedPressable
              style={[s.colorSwatch, primaryStyle]}
              onPress={() => {
                colorPicker.modal.current?.present({
                  color: sharedPrimary,
                  extraData: { name: 'primary' },
                });
                dismiss();
              }}
            />
          </View>
          <View style={s.colorContainer}>
            <AnimatedPressable
              style={[s.colorSwatch, accent1Style]}
              onPress={() => {
                colorPicker.modal.current?.present({
                  color: sharedAccent1,
                  extraData: { name: 'accent1' },
                });
                dismiss();
              }}
            />
          </View>
          <View style={s.colorContainer}>
            <AnimatedPressable
              style={[s.colorSwatch, accent2Style]}
              onPress={() => {
                colorPicker.modal.current?.present({
                  color: sharedAccent2,
                  extraData: { name: 'accent2' },
                });
                dismiss();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    marginHorizontal: 15,
  },
  colorBar: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: theme.colors.hintGray,
  },
  colorContainer: {
    marginHorizontal: 5,
  },
  colorText: {
    ...theme.text.normal,
    marginRight: 10,
  },
  colorSwatch: {
    width: 35,
    height: 35,
    borderRadius: 35,
  },
}));

export { DeckCardPropertiesModal };
