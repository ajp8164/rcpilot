import { ListItem } from '@react-native-hello/ui';
import { makeStyles } from '@rn-vui/themed';
import React from 'react';
import { Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';

interface ListItemNotes extends ListItem {
  notes?: string;
}

const ListItemNotes = (props: ListItemNotes) => {
  const { notes, ...rest } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <ListItem
      rightContent={'chevron-right'}
      {...rest}
      mainContent={
        <View style={s.container}>
          <Text style={s.content}>{notes || 'Notes'}</Text>
        </View>
      }
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 15,
    paddingVertical: 10,
  },
  content: {
    ...theme.styles.textNormal,
  },
}));

export { ListItemNotes };
