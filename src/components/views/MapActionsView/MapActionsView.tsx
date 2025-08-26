import React, { useImperativeHandle } from 'react';
import { Text, View } from 'react-native';

import { Divider, ThemeManager, useTheme } from '@react-native-hello/ui';
import LocationsView from 'components/views/LocationsView';

import { MapActionsViewMethods, MapActionsViewProps } from './types';

type MapActionsView = MapActionsViewMethods;

const MapActionsView = React.forwardRef<MapActionsView, MapActionsViewProps>(
  (_props, ref) => {
    const theme = useTheme();
    const s = useStyles();

    useImperativeHandle(ref, () => ({
      //  These functions exposed to the parent component through the ref.
    }));

    return (
      <View style={theme.styles.view}>
        <Text style={s.title}>{'All Locations'}</Text>
        <Divider />
        <LocationsView />
      </View>
    );
  },
);

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  title: {
    ...theme.text.h4,
    fontWeight: '700',
  },
}));

export default MapActionsView;
