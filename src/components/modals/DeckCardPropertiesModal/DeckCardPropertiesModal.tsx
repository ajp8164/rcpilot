import { DeckCardPropertiesModalMethods, DeckCardPropertiesModalProps } from './types';
import { AppTheme, useTheme } from 'theme';
import React, { useImperativeHandle, useRef } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, ModalHeader } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rneui/themed';
import { Pressable, Text, View } from 'react-native';
import { ColorPickerModal } from 'components/modals/ColorPickerModal';

type DeckCardPropertiesModal = DeckCardPropertiesModalMethods;

const DeckCardPropertiesModal = React.forwardRef<
  DeckCardPropertiesModal,
  DeckCardPropertiesModalProps
>((props, ref) => {
  const { colors, snapPoints = [200] } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const innerRef = useRef<BottomSheetModalMethods>(null);
  const colorPickerModalRef = useRef<ColorPickerModal>(null);

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
            <Pressable
              style={[s.colorSwatch, { backgroundColor: colors.primary }]}
              onPress={() => colorPickerModalRef.current?.present(colors.primary)}
            />
          </View>
          <View style={s.colorContainer}>
            <Text style={s.colorText}>{'Accent 1'}</Text>
            <Pressable
              style={[s.colorSwatch, { backgroundColor: colors.accent1 }]}
              onPress={() => colorPickerModalRef.current?.present(colors.accent1)}
            />
          </View>
          <View style={s.colorContainer}>
            <Text style={s.colorText}>{'Accent 2'}</Text>
            <Pressable
              style={[s.colorSwatch, { backgroundColor: colors.accent2 }]}
              onPress={() => colorPickerModalRef.current?.present(colors.accent2)}
            />
          </View>
        </View>
      </Modal>
      <ColorPickerModal ref={colorPickerModalRef} onSelectColor={color => console.log(color)} />
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
