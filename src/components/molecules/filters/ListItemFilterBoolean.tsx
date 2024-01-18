import { ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';

import { useState } from "react";
import { useTheme } from 'theme';

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
  const theme = useTheme();
  
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
        value={undefined} // Prevent propagation of this components props.value
        segments={[
          { label: BooleanRelation.Any, labelStyle: theme.styles.textTiny },
          { label: BooleanRelation.Yes, labelStyle: theme.styles.textTiny },
          { label: BooleanRelation.No, labelStyle: theme.styles.textTiny }
        ]}
        onChangeIndex={onRelationSelect}
      />
    </>
  );
}

export { ListItemFilterBoolean };
