import { AppTheme, useTheme } from 'theme';
import { Text, View } from 'react-native';
import { fontFamily, fontSizes } from '@react-native-ajp-elements/ui';

import React from 'react';
import { makeStyles } from '@rneui/themed';

interface SectionListHeaderInterface {
  title?: string;
}

const SectionListHeader = ({
  title,
}: SectionListHeaderInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <View style={s.sectionHeaderContainer}>
      <Text style={s.sectionHeader}>
        {title}
      </Text>
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  sectionHeaderContainer: {
    height: 52,
    paddingTop: 25,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.listHeaderBackground,
  },
  sectionHeader: {
    color: theme.colors.textDim,
    fontSize: fontSizes.small,
    fontWeight: '500',
    fontFamily,
  },
}));

export { SectionListHeader };
