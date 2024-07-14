import { DeckCardPropertiesModalMethods, DeckCardPropertiesModalProps } from './types';
import { AppTheme, useTheme } from 'theme';
import React, { useImperativeHandle, useRef } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, ModalHeader } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rneui/themed';
import { Pressable, Text, View } from 'react-native';
import { ColorPickerModal, Result } from 'components/modals/ColorPickerModal';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

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
  const colorPickerModalRef = useRef<ColorPickerModal>(null);

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

  const onSelectColor = (_result: Result) => {
    onChangeColors({
      primary: sharedPrimary.value,
      accent1: sharedAccent1.value,
      accent2: sharedAccent2.value,
    });
  };

  return (
    <>
      <Modal
        ref={innerRef}
        snapPoints={snapPoints}
        scrollEnabled={false}
        enableGestureBehavior={true}>
        <ModalHeader
          title={'Card Colors'}
          size={'small'}
          rightButtonIcon={'close-circle'}
          rightButtonIconColor={theme.colors.midGray}
          onRightButtonPress={dismiss}
        />
        <View style={s.container}>
          <View style={s.colorContainer}>
            <Text style={s.colorText}>{'Primary'}</Text>
            <AnimatedPressable
              style={[s.colorSwatch, primaryStyle]}
              onPress={() => colorPickerModalRef.current?.present({ color: sharedPrimary })}
            />
          </View>
          <View style={s.colorContainer}>
            <Text style={s.colorText}>{'Accent 1'}</Text>
            <AnimatedPressable
              style={[s.colorSwatch, accent1Style]}
              onPress={() => colorPickerModalRef.current?.present({ color: sharedAccent1 })}
            />
          </View>
          <View style={s.colorContainer}>
            <Text style={s.colorText}>{'Accent 2'}</Text>
            <AnimatedPressable
              style={[s.colorSwatch, accent2Style]}
              onPress={() => colorPickerModalRef.current?.present({ color: sharedAccent2 })}
            />
          </View>
        </View>
      </Modal>
      <ColorPickerModal ref={colorPickerModalRef} onDismiss={onSelectColor} />
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
