import React, { useImperativeHandle } from 'react';
import { Text, View } from 'react-native';

import { Divider, ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import LocationsView from 'components/views/LocationsView';
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

    const renderActionButtons = (): React.ReactElement => {
      return (
        <View style={{}}>
          <Button
            containerStyle={s.button}
            buttonStyle={theme.styles.buttonScreenHeader}
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

    return (
      <View style={theme.styles.view}>
        <Text style={s.title}>{'All Locations'}</Text>
        <Divider />
        {renderActionButtons()}
        <Divider />
        <LocationsView />
      </View>
    );
  },
);

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  button: {
    width: 80,
    height: 50,
    backgroundColor: theme.colors.screenHeaderButtonText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...theme.text.h4,
    fontWeight: '700',
  },
}));

export default MapActionsView;
