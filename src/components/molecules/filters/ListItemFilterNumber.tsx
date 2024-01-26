import { ListItemInput, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { NumberFilterState, NumberRelation } from 'components/molecules/filters';
import { useRef, useState } from "react";

import { FakeCurrencyInputProps } from 'react-native-currency-input';
import lodash from 'lodash';
import { useTheme } from 'theme';

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  label?: string;
  numericProps?: Omit<FakeCurrencyInputProps, 'value'>;
  onValueChange: (filterState: NumberFilterState) => void;
  relation: NumberRelation;
  title: string;
  value: string[];
};

const ListItemFilterNumber = (props: Props) => {
  const theme = useTheme();
  
  const {
    label,
    numericProps,
    onValueChange,
    position,
    relation: initialRelation,
    title,
    value: initialValue,
  } = props;

  const [expanded, setExpanded] = useState(initialValue.length > 0);
  const [relation, setRelation] = useState<NumberRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const segments = [
    { label: NumberRelation.Any, labelStyle: theme.styles.textTiny },
    { label: `  ${NumberRelation.LT}  `, labelStyle: theme.styles.textTiny },
    { label: `  ${NumberRelation.GT}  `, labelStyle: theme.styles.textTiny },
    { label: `  ${NumberRelation.EQ}  `, labelStyle: theme.styles.textTiny },
    { label: `  ${NumberRelation.NE}  `, labelStyle: theme.styles.textTiny }
  ];

  const initiaIndex = useRef(segments.findIndex(seg => {
    return seg.label === initialRelation
  })).current;

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
    </>
  );
}

export { ListItemFilterNumber };
