import { ColorPickerModalMethods, ColorPickerModalProps, PresentOptions } from './types';
import { AppTheme, useTheme } from 'theme';
import React, { useCallback, useContext, useImperativeHandle, useRef, useState } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, ModalHeader, viewport } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rn-vui/themed';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Pressable, Text, View } from 'react-native';
import ColorPicker, {
  Panel5,
  returnedResults,
  Panel4,
  RedSlider,
  GreenSlider,
  BlueSlider,
} from 'reanimated-color-picker';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { SkImage, makeImageFromView } from '@shopify/react-native-skia';
import { Eyedropper } from './Eyedropper';
import { ColorPickerContext } from 'components/modals/ColorPickerModal';
import { log } from '@react-native-ajp-elements/core';
import ModalHandle from 'components/atoms/ModalHandle';

type ColorPickerModal = ColorPickerModalMethods;

const ColorPickerModal = React.forwardRef<ColorPickerModal, ColorPickerModalProps>((props, ref) => {
  const { eyedropperViewRef, snapPoints = ['70%'] } = props;

  const theme = useTheme();
  const s = useStyles(theme);
  const { extraData, recentColors, onDismiss, onEyedropper, setRecentColors } =
    useContext(ColorPickerContext);

  const innerRef = useRef<BottomSheetModalMethods>(null);

  const defaultColor = theme.colors.stickyBlack;

  const externalColor = useRef<SharedValue<string>>();
  const internalSharedColor = useSharedValue(defaultColor);
  const [internalColor, setInternalColor] = useState(defaultColor);
  const [originalColor, setOriginalColor] = useState(defaultColor);
  const previewStyle = useAnimatedStyle(() => ({ backgroundColor: internalSharedColor.value }));

  const eyedropperActive = useRef(false);
  const [eyedropperImage, setEyedropperImage] = useState<SkImage | null>(null);

  // Used to force a re-render when shared values are updated.
  const [render, setRendrer] = useState(false);

  const colorPickers = {
    grid: { label: 'Grid', index: 0 },
    spectrum: { label: 'Spectrum', index: 1 },
    sliders: { label: 'Sliders', index: 2 },
  };

  const colorPickerSegments = Object.keys(colorPickers).map(
    k => colorPickers[k as keyof typeof colorPickers].label,
  );
  const [selectedColorPicker, setSelectedColorPicker] = useState(colorPickers.grid.index);

  useImperativeHandle(ref, () => ({
    // These functions exposed to the parent component through the ref.
    dismiss,
    present,
  }));

  const dismiss = () => {
    innerRef.current?.dismiss();
  };

  const present = (opts?: PresentOptions) => {
    const inputColor = typeof opts?.color === 'string' ? opts?.color : opts?.color?.value;
    setOriginalColor(inputColor || defaultColor);

    // Can optionally pass in a shared color value for animation of color in callers components.
    if (inputColor) {
      // Initialize color if provided.
      internalSharedColor.value = inputColor;
      setInternalColor(inputColor); // Needed to force the grid to re-render with this initial color.

      // Hold on to the callers shared value so it can be updated when the color changes.
      if (typeof opts?.color !== 'string') {
        externalColor.current = opts?.color;
      }
    }

    // Can optionally provide data that will pass through from present to dismiss.
    if (opts?.extraData) {
      extraData.current = opts.extraData;
    }

    setSelectedColorPicker(colorPickers.grid.index);
    innerRef.current?.present();
  };

  const openEyedropper = useCallback(() => {
    // Dismiss (hide) modal while using the eyedropper.
    eyedropperActive.current = true;
    dismiss();
    onEyedropper(true);

    if (!eyedropperViewRef) return;
    makeImageFromView(eyedropperViewRef)
      .then(snapshot => {
        setEyedropperImage(snapshot);
      })
      .catch(() => log.debug('No image for color picker eyedropper'));
  }, [eyedropperViewRef, onEyedropper]);

  const onChangeColor = (color: returnedResults | string) => {
    let selectedColor;
    if (typeof color === 'string') {
      selectedColor = color;
    } else {
      selectedColor = color.hex;
    }

    internalSharedColor.value = selectedColor;
    if (externalColor.current) {
      externalColor.current.value = selectedColor;
    }

    // Force a render to have the colot controls refresh with a possible new shared color value
    // (spectrum and sliders).
    setTimeout(() => {
      setRendrer(!render);
    });

    // If the eyedropper was in use then re-present the modal.
    if (eyedropperActive.current) {
      eyedropperActive.current = false;
      present();
      onEyedropper(false);
    }
  };

  const returnResult = () => {
    if (!eyedropperActive.current) {
      onDismiss({
        color: internalSharedColor.value,
        originalColor,
        extraData: extraData.current,
      });

      if (originalColor !== recentColors[0]) {
        setRecentColors([originalColor, ...recentColors].slice(0, 12));
      }
    }
  };

  return (
    <>
      <Modal
        ref={innerRef}
        snapPoints={snapPoints}
        scrollEnabled={false}
        enableGestureBehavior={true}
        handleComponent={ModalHandle}
        onDismiss={returnResult}>
        <ModalHeader
          title={'Colors'}
          size={'small'}
          leftButtonIcon={'eyedropper'}
          leftButtonIconColor={theme.colors.screenHeaderButtonText}
          onLeftButtonPress={openEyedropper}
          rightButtonIcon={'close-circle'}
          rightButtonIconColor={theme.colors.lightGray}
          onRightButtonPress={dismiss}
        />
        <View style={s.container}>
          <SegmentedControl
            values={colorPickerSegments}
            style={s.segmentedControl}
            tintColor={theme.colors.viewAltBackground}
            backgroundColor={theme.colors.wispGray}
            fontStyle={s.segmentedFont}
            activeFontStyle={s.segmentedActiveFont}
            selectedIndex={selectedColorPicker}
            onChange={event => {
              setSelectedColorPicker(event.nativeEvent.selectedSegmentIndex);
            }}
          />
          <View style={s.pickerContainer}>
            {selectedColorPicker === colorPickers.grid.index && (
              <ColorPicker value={internalColor} onChange={onChangeColor}>
                <Panel5 style={s.panelGrid} />
              </ColorPicker>
            )}
            {selectedColorPicker === colorPickers.spectrum.index && (
              <ColorPicker
                value={internalSharedColor.value}
                thumbSize={35}
                thumbScaleAnimationValue={1}
                thumbShape={'circle'}
                onChange={onChangeColor}>
                <Panel4 style={s.panelSpectrum} />
              </ColorPicker>
            )}
            {selectedColorPicker === colorPickers.sliders.index && (
              <ColorPicker
                value={internalSharedColor.value}
                sliderThickness={35}
                thumbSize={35}
                thumbScaleAnimationValue={1}
                thumbShape={'circle'}
                thumbAnimationDuration={100}
                adaptSpectrum
                boundedThumb
                onChange={onChangeColor}>
                <Text style={s.sliderTitle}>{'RED'}</Text>
                <RedSlider style={s.slider} />
                <Text style={s.sliderTitle}>{'GREEN'}</Text>
                <GreenSlider style={s.slider} />
                <Text style={s.sliderTitle}>{'BLUE'}</Text>
                <BlueSlider style={s.slider} />
              </ColorPicker>
            )}
            <View style={s.previewContainer}>
              <Animated.View style={[s.preview, previewStyle]} />
              <View style={s.recentContainer}>
                {recentColors.map((c, index) => {
                  return (
                    <View key={`${index}`} style={s.colorContainer}>
                      <Pressable
                        style={[s.colorSwatch, { backgroundColor: c }]}
                        onPress={() => onChangeColor(c)}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {eyedropperImage !== null ? (
        <Eyedropper
          image={eyedropperImage}
          setImage={setEyedropperImage}
          onSelectColor={onChangeColor}
        />
      ) : null}
    </>
  );
});

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'center',
    marginTop: 10,
  },
  segmentedControl: {
    width: viewport.width - 30,
    marginHorizontal: 15,
  },
  segmentedFont: {
    fontSize: 12,
    color: theme.colors.text,
  },
  segmentedActiveFont: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  pickerContainer: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 15,
    marginTop: 20,
  },
  panelGrid: {
    borderRadius: 7,
  },
  panelSpectrum: {
    borderRadius: 7,
    height: 300,
  },
  previewContainer: {
    position: 'absolute',
    bottom: 75,
    left: 15,
    flexDirection: 'row',
  },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  recentContainer: {
    alignContent: 'space-between',
    paddingLeft: 10,
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
  },
  colorContainer: {
    marginHorizontal: 5,
  },
  colorSwatch: {
    width: 35,
    height: 35,
    borderRadius: 35,
  },
  sliderTitle: {
    ...theme.styles.textTiny,
    marginBottom: 5,
  },
  slider: {
    borderRadius: 20,
    marginBottom: 20,
  },
}));

export { ColorPickerModal };
