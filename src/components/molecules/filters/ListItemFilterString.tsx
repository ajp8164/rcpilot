import { ListItem, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { StringFilterState, StringRelation } from 'components/molecules/filters';

import lodash from 'lodash';
import { useNavigation } from '@react-navigation/core';
import { useState } from "react";
import {useTheme} from "theme";

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  onValueChange: (filterState: StringFilterState) => void;
  relation?: StringRelation;
  title: string;
  value?: string;
};

const ListItemFilterString = (props: Props) => {
  const {
    onValueChange,
    position,
    relation: initialRelation = StringRelation.Any,
    title,
    value: initialValue,
  } = props;

  const theme = useTheme();
  const navigation = useNavigation<any>();

  const [expanded, setExpanded] = useState(false);
  const [relation, setRelation] = useState<StringRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const onRelationSelect = (index: number) => {
    const newRelation = Object.keys(StringRelation)[index] as StringRelation;
    setRelation(newRelation);
    onValueChange({relation: newRelation, value});
    setExpanded(index > 0);
  };

  const onChangedFilter = (value: string) => {
    // Set our local state and pass the entire state back to the caller.
    setValue(value);
    onValueChange({relation, value});
  };    

  return (
    <>
      <ListItemSegmented
        {...props}
        title={title}
        value={undefined} // Prevent propagation of this components props.value
        segments={[
          { label: StringRelation.Any, labelStyle: theme.styles.textTiny },
          { label: StringRelation.Contains, labelStyle: theme.styles.textTiny },
          { label: StringRelation.Missing, labelStyle: theme.styles.textTiny }
        ]}
        position={expanded && position ? lodash.without(position, 'last') : position}
        onChangeIndex={onRelationSelect}
        expanded={expanded}
        ExpandableComponent={
          <ListItem
            title={'The Text'}
            titleStyle={!value ? {color: theme.colors.assertive}: {}}
            subtitle={!value ?  'Matching text not specified' : value}
            position={position?.includes('last') ?  ['last'] : []}
            onPress={() => navigation.navigate('Notes', {title: 'String Value', onDone: onChangedFilter})}
          />
        }
      />
    </>
  );
}

export { ListItemFilterString };
