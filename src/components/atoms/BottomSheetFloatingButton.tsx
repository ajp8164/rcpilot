import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';

interface BottomSheetFloatingButton extends Button {
  animatedPosition: SharedValue<number>;
}

export const BottomSheetFloatingButton = (props: BottomSheetFloatingButton) => {
  const { animatedPosition, ...rest } = props;

  const theme = useTheme();
  const s = useStyles();

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: animatedPosition ? animatedPosition.value : 0 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -50,
          left: 10,
        },
        buttonStyle,
      ]}>
      <Button
        buttonStyle={theme.styles.buttonScreenHeader}
        containerStyle={s.button}
        {...rest}
      />
    </Animated.View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  button: {
    height: 40,
    paddingRight: 10,
    backgroundColor: theme.colors.screenHeaderButtonText,
  },
}));
