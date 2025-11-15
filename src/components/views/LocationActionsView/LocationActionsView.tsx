import React, { useImperativeHandle } from 'react';
import { Text, View } from 'react-native';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { Check, SquarePen, Trash2 } from 'lucide-react-native';

import { LocationActionsViewMethods, LocationActionsViewProps } from './types';

type LocationActionsView = LocationActionsViewMethods;

const LocationActionsView = React.forwardRef<
  LocationActionsView,
  LocationActionsViewProps
>((props, ref) => {
  const {
    mode = 'default',
    showDelete,
    style,
    onPressDelete,
    onPressDone,
    onPressEdit,
  } = props;

  const theme = useTheme();
  const s = useStyles();

  useImperativeHandle(ref, () => ({
    //  These functions exposed to the parent component through the ref.
  }));

  return (
    <View style={[{ flexDirection: 'row' }, style]}>
      {mode === 'edit' ? (
        <>
          <Button
            buttonStyle={s.actionButton}
            iconContainerStyle={{ marginLeft: 0 }}
            icon={
              <View style={{ width: '100%', alignItems: 'center' }}>
                <Check color={theme.colors.stickyWhite} size={24} />
                <Text
                  style={{
                    ...theme.text.tiny,
                    color: theme.colors.stickyWhite,
                  }}>
                  {'Done'}
                </Text>
              </View>
            }
            onPress={() => onPressDone?.()}
          />
          {showDelete ? (
            <Button
              buttonStyle={{
                ...s.actionButton,
                ...s.buttonAssertive,
                ...s.buttonNext,
              }}
              iconContainerStyle={{ marginLeft: 0 }}
              icon={
                <View style={{ width: '100%', alignItems: 'center' }}>
                  <Trash2 color={theme.colors.stickyWhite} size={24} />
                  <Text
                    style={{
                      ...theme.text.tiny,
                      color: theme.colors.stickyWhite,
                    }}>
                    {'Delete'}
                  </Text>
                </View>
              }
              onPress={() => onPressDelete()}
            />
          ) : null}
        </>
      ) : (
        <Button
          buttonStyle={s.actionButton}
          iconContainerStyle={{ marginLeft: 0 }}
          icon={
            <View style={{ width: '100%', alignItems: 'center' }}>
              <SquarePen color={theme.colors.stickyWhite} size={24} />
              <Text
                style={{
                  ...theme.text.tiny,
                  color: theme.colors.stickyWhite,
                }}>
                {'Edit'}
              </Text>
            </View>
          }
          onPress={() => onPressEdit?.()}
        />
      )}
    </View>
  );
});

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  actionButton: {
    ...theme.styles.button,
    width: 80,
    height: 50,
  },
  buttonAssertive: {
    backgroundColor: theme.colors.assertive,
  },
  buttonNext: {
    marginLeft: 10,
  },
}));

export default LocationActionsView;
