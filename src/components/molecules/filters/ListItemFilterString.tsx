import { ListItem, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { StringFilterState, StringRelation } from 'components/molecules/filters';
import { useEffect, useState } from "react";

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
    title,
  } = props;

  const theme = useTheme();
  const navigation = useNavigation<any>();

  const segments = [
    StringRelation.Any,
    StringRelation.Contains,
    StringRelation.Missing,
  ];
  
  const [expanded, setExpanded] = useState(props.value.length > 0);
  const [relation, setRelation] = useState<StringRelation>(props.relation);
  const [value, setValue] = useState(props.value);
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => { return seg === props.relation })
  );

  // Controlled component state changes.
  useEffect(() => {
    const newIndex = segments.findIndex(seg => { return seg === props.relation });
    setIndex(newIndex);
    setRelation(props.relation);
    setValue(props.value);
    setExpanded(newIndex > 0);
  }, [ props.relation, props.value ]);
  
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
    <ListItemSegmented
      {...props}
      title={title}
      value={undefined} // Prevent propagation of this components props.value
      index={index}
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
  );
}

export { ListItemFilterString };
