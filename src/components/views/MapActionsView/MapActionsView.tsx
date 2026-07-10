import React from 'react';
import { Text, View } from 'react-native';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { MapPinPlus } from 'lucide-react-native';

import { MapActionsViewProps } from './types';

const MapActionsView = ({ onPressAddLocation }: MapActionsViewProps) => {
  const theme = useTheme();
  const s = useStyles();

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 15 }}>
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
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  actionButton: {
    ...theme.styles.button,
    paddingHorizontal: 0,
    width: 80,
    height: 50,
  },
}));

export default MapActionsView;
