import { ListItem, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { StringFilterState, StringRelation } from 'components/molecules/filters';
import { useRef, useState } from "react";

import lodash from 'lodash';
import { useNavigation } from '@react-navigation/core';
import {useTheme} from "theme";

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  onValueChange: (filterState: StringFilterState) => void;
  relation: StringRelation;
  title: string;
  value: string[];
};

const ListItemFilterString = (props: Props) => {
  const {
    onValueChange,
    position,
    relation: initialRelation,
    title,
    value: initialValue,
  } = props;

  const theme = useTheme();
  const navigation = useNavigation<any>();

  const [expanded, setExpanded] = useState(initialValue.length > 0);
  const [relation, setRelation] = useState<StringRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const segments = [
    { label: StringRelation.Any, labelStyle: theme.styles.textTiny },
    { label: StringRelation.Contains, labelStyle: theme.styles.textTiny },
    { label: StringRelation.Missing, labelStyle: theme.styles.textTiny }
  ];

  const initiaIndex = useRef(segments.findIndex(seg => {
    return seg.label === initialRelation
  })).current;
  
  const onRelationSelect = (index: number) => {
    const newRelation = Object.values(StringRelation)[index] as StringRelation;
    setRelation(newRelation);
    onValueChange({relation: newRelation, value});
    setExpanded(index > 0);
  };

  const onChangedFilter = (value: string) => {
    // Set our local state and pass the entire state back to the caller.
    setValue([value]);
    onValueChange({relation, value: [value]});
  };    

  return (
    <>
      <ListItemSegmented
        {...props}
        title={title}
        value={undefined} // Prevent propagation of this components props.value
        initialIndex={initiaIndex}
        segments={segments}
        position={expanded && position ? lodash.without(position, 'last') : position}
        onChangeIndex={onRelationSelect}
        expanded={expanded}
        ExpandableComponent={
          <ListItem
            title={'The Text'}
            titleStyle={!value ? {color: theme.colors.assertive}: {}}
            subtitle={!value.length ?  'Matching text not specified' : value[0]}
            position={position?.includes('last') ?  ['last'] : []}
            onPress={() => navigation.navigate('Notes', {title: 'String Value', onDone: onChangedFilter})}
          />
        }
      />
    </>
  );
}

export { ListItemFilterString };
