import {
  ListItemInput,
  ListItemSegmented,
  ListItemSegmentedInterface,
} from 'components/atoms/List';
import { NumberFilterState, NumberRelation } from 'components/molecules/filters';
import { useEffect, useRef, useState } from 'react';

import { FakeCurrencyInputProps } from 'react-native-currency-input';
import React from 'react-native';
import lodash from 'lodash';
import { useTheme } from 'theme';

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  label?: string;
  numericProps?: Omit<FakeCurrencyInputProps, 'value'>;
  onValueChange: (filterState: NumberFilterState) => void;
  relation: NumberRelation;
  title: string;
  value: string[];
}

const ListItemFilterNumber = (props: Props) => {
  const { label, numericProps, onValueChange, position, title } = props;

  const theme = useTheme();

  const segments = [
    NumberRelation.Any,
    NumberRelation.LT,
    NumberRelation.GT,
    NumberRelation.EQ,
    NumberRelation.NE,
  ];

  const initializing = useRef(true);
  const [expanded, setExpanded] = useState(props.value.length > 0);
  const [filterState, setFilterState] = useState<NumberFilterState>({
    relation: props.relation,
    value: props.value.length ? props.value : [],
  });
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

    if (props.relation !== filterState.relation && props.relation === NumberRelation.Any) {
      // Closing (moving relation to Any)
      setExpanded(false);
      setTimeout(() => {
        setFilterState({ relation: props.relation, value: props.value });
      }, 300);
    } else if (props.relation !== filterState.relation && props.relation !== NumberRelation.Any) {
      // Opening (moving relation to something other than Any)
      setFilterState({ relation: props.relation, value: props.value });
      setTimeout(() => {
        setExpanded(true);
      }, 300);
    } else {
      setFilterState({ relation: props.relation, value: props.value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.relation, props.value]);

  const onRelationSelect = (index: number) => {
    const newRelation = Object.values(NumberRelation)[index] as NumberRelation;

    // Reset the value of the filter if choosing Any.
    let newValue = filterState.value;
    if (newRelation === NumberRelation.Any) {
      newValue = [];
    }

    if (newRelation !== NumberRelation.Any) {
      // Opening
      setFilterState({ relation: newRelation, value: newValue });
      onValueChange({ relation: newRelation, value: newValue });
      setTimeout(() => {
        setExpanded(true);
      });
    } else {
      // Closing
      setExpanded(false);
      setTimeout(() => {
        setFilterState({ relation: newRelation, value: newValue });
        onValueChange({ relation: newRelation, value: newValue });
      }, 300);
    }
  };

  const onChangedFilter = (value: string) => {
    // Set our local state and pass the entire state back to the caller only if
    // the input is visible - this prevents the text-input from bubbling events up
    // when the caller of this list item has controlled this component without
    // interacting with the text-input (e.g. a filter reset).
    if (expanded) {
      setFilterState({ relation: filterState.relation, value: [value] });
      onValueChange({ relation: filterState.relation, value: [value] });
    }
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
          titleStyle={filterState.value?.length === 0 ? { color: theme.colors.assertive } : {}}
          label={label}
          position={position?.includes('last') ? ['last'] : []}
          keyboardType={'number-pad'}
          numeric={true}
          numericProps={numericProps}
          value={filterState.value[0]}
          placeholder={'0'}
          onChangeText={onChangedFilter}
        />
      }
    />
  );
};

export { ListItemFilterNumber };
