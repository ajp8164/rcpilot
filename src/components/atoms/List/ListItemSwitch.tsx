import { AppTheme, useTheme } from 'theme';
import React from 'react';

import { CollapsibleView } from 'components/atoms/CollapsibleView';
import { ListItemSwitch as _ListItemSwitch } from '@react-native-ajp-elements/ui';
import { makeStyles } from '@rn-vui/themed';

interface Props extends _ListItemSwitch {
  expanded?: boolean;
  ExpandableComponent?: React.ReactElement;
}

const ListItemSwitch = (props: Props) => {
  const { expanded = false, ExpandableComponent } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const first = props.position?.includes('first') ? 'first' : undefined;

  return (
    <>
      <_ListItemSwitch
        titleStyle={s.title}
        subtitleStyle={s.subtitle}
        {...props}
        containerStyle={{ ...props.containerStyle, ...s.container }}
        position={expanded ? [first] : props.position}
      />
      <CollapsibleView expanded={expanded}>
        {ExpandableComponent}
      </CollapsibleView>
    </>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  container: {
    minHeight: 48,
  },
  title: {
    width: '120%',
  },
  subtitle: {
    width: '120%',
  },
}));

export { ListItemSwitch };
