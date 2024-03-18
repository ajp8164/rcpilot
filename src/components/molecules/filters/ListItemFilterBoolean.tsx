import { BooleanFilterState, BooleanRelation } from 'components/molecules/filters';
import { ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { useEffect, useRef, useState } from 'react';

import React from 'react-native';

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  label?: string;
  onValueChange: (filterState: BooleanFilterState) => void;
  relation: BooleanRelation;
  title: string;
}

const ListItemFilterBoolean = (props: Props) => {
  const { onValueChange, title } = props;

  const segments = [BooleanRelation.Any, BooleanRelation.Yes, BooleanRelation.No];

  const initializing = useRef(true);
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => {
      return seg === props.relation;
    }),
  );

  // Controlled component state changes.
  useEffect(() => {
    if (initializing.current) {
      initializing.current = false;
      return;
    }
    const newIndex = segments.findIndex(seg => {
      return seg === props.relation;
    });
    setIndex(newIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.relation]);

  const onRelationSelect = (index: number) => {
    const newRelation = Object.values(BooleanRelation)[index] as BooleanRelation;
    onValueChange({ relation: newRelation, value: [] });
  };

  return (
    <ListItemSegmented
      {...props}
      title={title}
      value={undefined} // Prevent propagation of this components props.value
      index={index}
      segments={segments}
      onChangeIndex={onRelationSelect}
    />
  );
};

export { ListItemFilterBoolean };
