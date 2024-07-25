import { DeckCardPropertiesModalMethods, DeckCardPropertiesModalProps } from './types';
import { AppTheme, useTheme } from 'theme';
import React, { useCallback, useContext, useImperativeHandle, useRef, useState } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, ModalHeader } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rneui/themed';
import { Pressable, Text, View } from 'react-native';
import { ColorPickerContext, Result } from 'components/modals/ColorPickerModal';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import ModalHandle from 'components/atoms/ModalHandle';
import { DeckCardColors } from 'types/preferences';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DeckCardPropertiesModal = DeckCardPropertiesModalMethods;

const DeckCardPropertiesModal = React.forwardRef<
  DeckCardPropertiesModal,
  DeckCardPropertiesModalProps
>((props, ref) => {
  const { colors: initialColors, onChangeColors, snapPoints = [200] } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const innerRef = useRef<BottomSheetModalMethods>(null);
  const colorPicker = useContext(ColorPickerContext);

  // Create state for returning result. The shared values cannot be returned to the caller.
  const [deckCardColors, setDeckCardColors] = useState<DeckCardColors>({
    primary: initialColors.primary,
    accent1: initialColors.accent1,
    accent2: initialColors.accent2,
  });

  const sharedPrimary = useSharedValue(initialColors.primary);
  const sharedAccent1 = useSharedValue(initialColors.accent1);
  const sharedAccent2 = useSharedValue(initialColors.accent2);

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

  const present = () => {
    innerRef.current?.present();
  };

  colorPicker.onDismiss = useCallback(
    (result: Result) => {
      const updated = {
        ...deckCardColors,
        [result.extraData.name]: result.color,
      };

      setDeckCardColors(updated);
      onChangeColors(updated);
    },
    [deckCardColors, onChangeColors],
  );

  return (
    <>
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
    </>
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
