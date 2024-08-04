import { DeckCardPropertiesModalMethods, DeckCardPropertiesModalProps } from './types';
import { AppTheme, useTheme } from 'theme';
import React, { useContext, useImperativeHandle, useRef, useState } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, ModalHeader } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rneui/themed';
import { Pressable, Text, View } from 'react-native';
import { ColorPickerContext, Result } from 'components/modals/ColorPickerModal';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import ModalHandle from 'components/atoms/ModalHandle';
import { DeckCardColors } from 'types/preferences';
import { useDispatch } from 'react-redux';
import { saveModelPreferences } from 'store/slices/appSettings';
import { store } from 'store';
import { defaultDinnCardColors } from 'components/molecules/card-deck/dinn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DeckCardPropertiesModal = DeckCardPropertiesModalMethods;

const DeckCardPropertiesModal = React.forwardRef<
  DeckCardPropertiesModal,
  DeckCardPropertiesModalProps
>((props, ref) => {
  const { snapPoints = [200] } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  const dispatch = useDispatch();

  const innerRef = useRef<BottomSheetModalMethods>(null);
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
      handleComponent={ModalHandle}>
      <ModalHeader
        title={'Card Colors'}
        size={'small'}
        rightButtonIcon={'close-circle'}
        rightButtonIconColor={theme.colors.lightGray}
        onRightButtonPress={dismiss}
      />
      <View style={s.container}>
        <View style={s.colorContainer}>
          <Text style={s.colorText}>{'Primary'}</Text>
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
          <Text style={s.colorText}>{'Accent 1'}</Text>
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
          <Text style={s.colorText}>{'Accent 2'}</Text>
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
    justifyContent: 'space-between',
    alignContent: 'center',
    marginTop: 10,
    marginHorizontal: 15,
    flexDirection: 'row',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  colorText: {
    ...theme.styles.textNormal,
    marginRight: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: theme.colors.lightGray,
  },
}));

export { DeckCardPropertiesModal };
