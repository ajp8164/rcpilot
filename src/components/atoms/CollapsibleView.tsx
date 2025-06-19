import { AppTheme, useTheme } from 'theme';
import React, { ReactNode } from 'react';

import { ViewStyle } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { makeStyles } from '@rn-vui/themed';

interface Props {
  children: ReactNode | ReactNode[];
  expanded?: boolean;
  style?: ViewStyle | ViewStyle[];
}

const CollapsibleView = (props: Props) => {
  const { children, expanded = true, style } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <Collapsible collapsed={!expanded} style={{ ...s.collapsible, ...style }}>
      <>{children}</>
    </Collapsible>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  collapsible: {
    padding: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    borderWidth: 0,
    overflow: 'hidden',
  },
}));

export { CollapsibleView };
