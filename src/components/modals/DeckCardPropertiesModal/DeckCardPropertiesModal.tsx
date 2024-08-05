import { DeckCardPropertiesModalMethods, DeckCardPropertiesModalProps } from './types';
import { AppTheme, useTheme } from 'theme';
import React, { useContext, useImperativeHandle, useRef, useState } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, ModalHeader } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rneui/themed';
import { Pressable, View } from 'react-native';
import { ColorPickerContext, Result } from 'components/modals/ColorPickerModal';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import ModalHandle from 'components/atoms/ModalHandle';
import { DeckCardColors } from 'types/preferences';
import { useDispatch } from 'react-redux';
import { saveModelPreferences } from 'store/slices/appSettings';
import { store } from 'store';
import { defaultDinnCardColors } from 'components/molecules/card-deck/dinn';
import { BackdropContext } from 'components/atoms/Backdrop';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DeckCardPropertiesModal = DeckCardPropertiesModalMethods;

const DeckCardPropertiesModal = React.forwardRef<
  DeckCardPropertiesModal,
  DeckCardPropertiesModalProps
>((props, ref) => {
  const { snapPoints = [150] } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  const dispatch = useDispatch();

  const innerRef = useRef<BottomSheetModalMethods>(null);
  const backdrop = useContext(BackdropContext);
  const colorPicker = useContext(ColorPickerContext);

  // Create state for returning result. The shared values cannot be returned to the caller.
  const sharedPrimary = useSharedValue('#000000'); // Any valid color, overwritten in present()
  const sharedAccent1 = useSharedValue('#000000');
  const sharedAccent2 = useSharedValue('#000000');

  const [deckCardColors, setDeckCardColors] = useState<DeckCardColors>({
    primary: sharedPrimary.value,
    accent1: sharedAccent1.value,
    accent2: sharedAccent2.value,
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
    const modelPreferences = store.getState().appSettings.modelsPreferences[modelId];

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
  };

  const onChangeColors = (colors: DeckCardColors) => {
    if (!modelId) return;
    const modelPreferences = store.getState().appSettings.modelsPreferences[modelId];
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
      scrollEnabled={false}
      enableGestureBehavior={true}
      backdrop={false}
      handleComponent={ModalHandle}
      onDismiss={() => backdrop.setEnabled(false)}>
      <ModalHeader
        title={'Card Preferences'}
        size={'small'}
        rightButtonIcon={'close-circle'}
        rightButtonIconColor={theme.colors.lightGray}
        onRightButtonPress={dismiss}
      />
      <View style={s.container}>
        <View style={s.colorContainer}>
          <AnimatedPressable
            style={[s.colorSwatch, primaryStyle]}
            onPress={() =>
              colorPicker.modal.current?.present({
                color: sharedPrimary,
                extraData: { name: 'primary' },
              })
            }
          />
        </View>
        <View style={s.colorContainer}>
          <AnimatedPressable
            style={[s.colorSwatch, accent1Style]}
            onPress={() =>
              colorPicker.modal.current?.present({
                color: sharedAccent1,
                extraData: { name: 'accent1' },
              })
            }
          />
        </View>
        <View style={s.colorContainer}>
          <AnimatedPressable
            style={[s.colorSwatch, accent2Style]}
            onPress={() =>
              colorPicker.modal.current?.present({
                color: sharedAccent2,
                extraData: { name: 'accent2' },
              })
            }
          />
        </View>
      </View>
    </Modal>
  );
});

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginHorizontal: 15,
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
    ...theme.styles.textNormal,
    marginRight: 10,
  },
  colorSwatch: {
    width: 35,
    height: 35,
    borderRadius: 35,
  },
}));

export { DeckCardPropertiesModal };
