import { ListItemInput, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { NumberFilterState, NumberRelation } from 'components/molecules/filters';
import { useEffect, useState } from "react";

import { FakeCurrencyInputProps } from 'react-native-currency-input';
import lodash from 'lodash';

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  label?: string;
  numericProps?: Omit<FakeCurrencyInputProps, 'value'>;
  onValueChange: (filterState: NumberFilterState) => void;
  relation: NumberRelation;
  title: string;
  value: string[];
};

const ListItemFilterNumber = (props: Props) => {  
  const {
    label,
    numericProps,
    onValueChange,
    position,
    title,
  } = props;

  const segments = [
    NumberRelation.Any,
    NumberRelation.LT,
    NumberRelation.GT,
    NumberRelation.EQ,
    NumberRelation.NE
  ];
  
  const [expanded, setExpanded] = useState(props.value.length > 0);
  const [relation, setRelation] = useState<NumberRelation>(props.relation);
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
    const newRelation = Object.values(NumberRelation)[index] as NumberRelation;
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
        <ListItemInput
          title={'Value'}
          label={label}
          position={position?.includes('last') ? ['last'] : []}
          keyboardType={'number-pad'}
          numeric
          numericProps={numericProps}
          value={value[0]}
          placeholder={'0'}
          onChangeText={onChangedFilter}
        />
      }
    />
  );
}

export { ListItemFilterNumber };
