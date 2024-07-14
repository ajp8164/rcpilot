import { ColorPickerModalMethods, ColorPickerModalProps, PresentOptions } from './types';
import { AppTheme, useTheme } from 'theme';
import React, { useImperativeHandle, useRef, useState } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, ModalHeader, viewport } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rneui/themed';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Text, View } from 'react-native';
import ColorPicker, {
  Panel5,
  returnedResults,
  Panel4,
  RedSlider,
  GreenSlider,
  BlueSlider,
} from 'reanimated-color-picker';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

type ColorPickerModal = ColorPickerModalMethods;

const ColorPickerModal = React.forwardRef<ColorPickerModal, ColorPickerModalProps>((props, ref) => {
  const { onDismiss, snapPoints = ['70%'] } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const innerRef = useRef<BottomSheetModalMethods>(null);

  const defaultColor = theme.colors.stickyBlack;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extraData = useRef<any>();
  const externalColor = useRef<SharedValue<string>>();
  const internalSharedColor = useSharedValue(defaultColor);
  const [internalColor, setInternalColor] = useState(defaultColor);
  const previewStyle = useAnimatedStyle(() => ({ backgroundColor: internalSharedColor.value }));

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
    // Can optionally pass in a shared color value for animation of color in callers components.
    if (opts?.color) {
      // Initialize color if provided.
      internalSharedColor.value = opts.color.value;
      setInternalColor(opts.color.value); // Needed to force the grid to re-render with this initial color.

      // Hold on to the callers shared value so it can be updated when the color chnages.
      externalColor.current = opts.color;
    }

    extraData.current = opts?.extraData;
    setSelectedColorPicker(colorPickers.grid.index);
    innerRef.current?.present();
  };

  const onChangeColor = (color: returnedResults) => {
    internalSharedColor.value = color.hex;
    if (externalColor.current) {
      externalColor.current.value = color.hex;
    }
  };

  return (
    <Modal
      ref={innerRef}
      snapPoints={snapPoints}
      scrollEnabled={false}
      enableGestureBehavior={true}
      onDismiss={() => onDismiss({ color: internalSharedColor.value })}>
      <ModalHeader
        title={'Colors'}
        size={'small'}
        leftButtonIcon={'eyedropper'}
        leftButtonIconColor={theme.colors.screenHeaderButtonText}
        rightButtonIcon={'close-circle'}
        rightButtonIconColor={theme.colors.midGray}
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
              thumbSize={24}
              thumbShape={'circle'}
              onChange={onChangeColor}>
              <Panel4 style={s.panelSpectrum} />
            </ColorPicker>
          )}
          {selectedColorPicker === colorPickers.sliders.index && (
            <ColorPicker
              value={internalSharedColor.value}
              sliderThickness={30}
              thumbSize={30}
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
          <Animated.View style={[s.preview, previewStyle]} />
        </View>
      </View>
    </Modal>
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
  preview: {
    position: 'absolute',
    bottom: 75,
    left: 15,
    width: 80,
    height: 80,
    marginTop: 15,
    borderRadius: 10,
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
