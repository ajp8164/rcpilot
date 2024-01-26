import { BooleanFilterState, BooleanRelation } from 'components/molecules/filters';
import { ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { useRef, useState } from "react";

import { useTheme } from 'theme';

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  label?: string;
  onValueChange: (filterState: BooleanFilterState) => void;
  relation: BooleanRelation;
  title: string;
  value: string;
};

const ListItemFilterBoolean = (props: Props) => {
  const theme = useTheme();
  
  const {
    onValueChange,
    relation: initialRelation,
    title,
    value: initialValue,
  } = props;

  const [relation, setRelation] = useState<BooleanRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const segments = [
    { label: BooleanRelation.Any, labelStyle: theme.styles.textTiny },
    { label: BooleanRelation.Yes, labelStyle: theme.styles.textTiny },
    { label: BooleanRelation.No, labelStyle: theme.styles.textTiny }
  ];

  const initiaIndex = useRef(segments.findIndex(seg => {
    return seg.label === initialRelation
  })).current;

  const onRelationSelect = (index: number) => {
    setRelation(Object.values(BooleanRelation)[index] as BooleanRelation);
    setValue(index === 1 ? 'true' : 'false');
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
        onChangeIndex={onRelationSelect}
      />
    </>
  );
}

export { ListItemFilterBoolean };
