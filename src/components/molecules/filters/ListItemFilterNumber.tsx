import { ListItemInput, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';

import lodash from 'lodash';
import { useState } from "react";

export type NumberFilter = {
  relation: NumberRelation;
  value: string;
};

export enum NumberRelation {
  Any = 'Any',
  LT = '<',
  GT = '>',
  EQ = '=',
  NE = '!=',
};

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  label?: string;
  onValueChange: (relation: NumberRelation, value: string) => void;
  relation?: NumberRelation;
  title: string;
  value: string;
};

const ListItemFilterNumber = (props: Props) => {
  const {
    label,
    onValueChange,
    position,
    relation: initialRelation = NumberRelation.Any,
    title,
    value: initialValue,
    } = props;

  const [expanded, setExpanded] = useState(false);
  const [relation, setRelation] = useState<NumberRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const onRelationSelect = (index: number) => {
    setRelation(Object.keys(NumberRelation)[index] as NumberRelation);
    setExpanded(index > 0);
  };

  const onChangedFilter = (value: string) => {
    // Set our local state and pass the entire state back to the caller.
    setValue(value);
    onValueChange(relation, value);
  };    

  return (
    <>
      <ListItemSegmented
        {...props}
        title={title}
        value={''}
        segments={[{ label: NumberRelation.Any }, { label: `  ${NumberRelation.LT}  ` }, { label: `  ${NumberRelation.GT}  ` }, { label: `  ${NumberRelation.EQ}  ` }, { label: `  ${NumberRelation.NE}  ` }]}
        position={expanded && position ? lodash.without(position, 'last') : position}
        onChangeIndex={onRelationSelect}
        expanded={expanded}
        ExpandableComponent={
          <ListItemInput
            title={'Value'}
            label={label}
            position={position?.includes('last') ?  ['last'] : []}
            keyboardType={'number-pad'}
            value={value + ''}
            onChangeText={onChangedFilter}
          />
        }
      />
    </>
  );
}

export { ListItemFilterNumber };
