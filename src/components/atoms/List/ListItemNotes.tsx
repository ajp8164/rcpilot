import React from 'react';
import { Text, View } from 'react-native';

import { ListItem, ThemeManager } from '@react-native-hello/ui';

interface ListItemNotes extends ListItem {
  notes?: string;
}

const ListItemNotes = (props: ListItemNotes) => {
  const { notes, ...rest } = props;

  const s = useStyles();

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

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 15,
    paddingVertical: 10,
  },
  content: {
    ...theme.text.normal,
  },
}));

export { ListItemNotes };
