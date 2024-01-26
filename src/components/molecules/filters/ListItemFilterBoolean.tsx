import { BooleanFilterState, BooleanRelation } from 'components/molecules/filters';
import { ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { useEffect, useState } from "react";

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  label?: string;
  onValueChange: (filterState: BooleanFilterState) => void;
  relation: BooleanRelation;
  title: string;
  value: string;
};

const ListItemFilterBoolean = (props: Props) => {  
  const {
    onValueChange,
    title,
  } = props;

  const segments = [
    BooleanRelation.Any,
    BooleanRelation.Yes,
    BooleanRelation.No
  ];
  
  const [relation, setRelation] = useState<BooleanRelation>(props.relation);
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
  }, [ props.relation, props.value ]);
  
  const onRelationSelect = (index: number) => {
    setRelation(Object.values(BooleanRelation)[index] as BooleanRelation);
    setValue(index === 1 ? 'true' : 'false');
    onValueChange({relation, value: [value]});
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
}

export { ListItemFilterBoolean };
