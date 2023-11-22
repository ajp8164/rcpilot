import { ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';

import { useState } from "react";

export type BooleanFilter = {
  relation: BooleanRelation;
  value: string;
};

export enum BooleanRelation {
  Any = 'Any',
  Yes = 'Yes',
  No = 'No',
};

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  label?: string;
  onValueChange: (relation: BooleanRelation, value: string) => void;
  relation?: BooleanRelation;
  title: string;
  value: string;
};

const ListItemFilterBoolean = (props: Props) => {
  const {
    onValueChange,
    relation: initialRelation = BooleanRelation.Any,
    title,
    value: initialValue,
    } = props;

  const [relation, setRelation] = useState<BooleanRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const onRelationSelect = (index: number) => {
    setRelation(Object.keys(BooleanRelation)[index] as BooleanRelation);
    setValue(index === 1 ? 'true' : 'false');
    onValueChange(relation, value);
  };

  return (
    <>
      <ListItemSegmented
        {...props}
        title={title}
        value={''}
        segments={[{ label: BooleanRelation.Any }, { label: BooleanRelation.Yes }, { label: BooleanRelation.No }]}
        onChangeIndex={onRelationSelect}
      />
    </>
  );
}

export { ListItemFilterBoolean };
