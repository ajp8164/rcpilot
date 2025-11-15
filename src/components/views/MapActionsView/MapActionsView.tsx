import React, { useImperativeHandle } from 'react';
import { Text, View } from 'react-native';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { MapPinPlus } from 'lucide-react-native';

import { MapActionsViewMethods, MapActionsViewProps } from './types';

type MapActionsView = MapActionsViewMethods;

const MapActionsView = React.forwardRef<MapActionsView, MapActionsViewProps>(
  (props, ref) => {
    const { onPressAddLocation } = props;

    const theme = useTheme();
    const s = useStyles();

    useImperativeHandle(ref, () => ({
      //  These functions exposed to the parent component through the ref.
    }));

    return (
      <View style={{ flexDirection: 'row' }}>
        <Button
          buttonStyle={s.actionButton}
          iconContainerStyle={{ marginLeft: 0 }}
          icon={
            <View style={{ width: '100%', alignItems: 'center' }}>
              <MapPinPlus color={theme.colors.stickyWhite} size={24} />
              <Text
                style={{
                  ...theme.text.tiny,
                  color: theme.colors.stickyWhite,
                }}>
                {'Add Location'}
              </Text>
            </View>
          }
          onPress={() => onPressAddLocation()}
        />
      </View>
    );
  },
);

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  actionButton: {
    ...theme.styles.button,
    paddingHorizontal: 0,
    width: 80,
    height: 50,
  },
}));

export default MapActionsView;
