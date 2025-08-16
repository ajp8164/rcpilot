import {
  InputMethods,
  ListItemInput as RNHListItemInput,
  useTheme,
} from '@react-native-hello/ui';
import { Pencil } from 'lucide-react-native';
import React from 'react';

export type ListItemInputMethods = InputMethods;

interface ListItemInput extends RNHListItemInput {}

const ListItemInput = React.forwardRef<ListItemInputMethods, ListItemInput>(
  (props, ref) => {
    const { ...rest } = props;

    const theme = useTheme();

    return (
      <RNHListItemInput
        ref={ref}
        {...rest}
        inputProps={{
          ...rest.inputProps,
          ComponentRight:
            rest.inputProps.editable === false ? null : (
              <Pencil color={theme.colors.listItemIcon} size={18} />
            ),
        }}
      />
    );
  },
);

export { ListItemInput };
