import {
  ListItemInput,
  ListItemInputMethods,
  ListItemSegmented,
  ListItemSegmentedInterface,
} from 'components/atoms/List';
import {
  NumberFilterState,
  NumberRelation,
} from 'components/molecules/filters';
import { useEffect, useRef, useState } from 'react';

import { FakeCurrencyInputProps } from 'react-native-currency-input';
import React from 'react';
import lodash from 'lodash';
import { useDebouncedRender } from 'lib/useDebouncedRender';

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

  const setDebounced = useDebouncedRender();

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

  const liRef = useRef<ListItemInputMethods>(null);

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

    if (
      props.relation !== filterState.relation &&
      props.relation === NumberRelation.Any
    ) {
      // Closing (moving relation to Any)
      setExpanded(false);
      setTimeout(() => {
        setFilterState({ relation: props.relation, value: props.value });
      }, 300);
    } else if (
      props.relation !== filterState.relation &&
      props.relation !== NumberRelation.Any
    ) {
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

    // Provide an initial default value.
    let newValue = filterState.value.length
      ? filterState.value
      : ['0', `${label}`];

    // Reset the value of the filter if choosing Any.
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

  const onChangedFilter = (value?: string) => {
    // Set our local state and pass the entire state back to the caller only if
    // the input is visible - this prevents the text-input from bubbling events up
    // when the caller of this list item has controlled this component without
    // interacting with the text-input (e.g. a filter reset).
    if (expanded) {
      if (value === undefined) {
        liRef.current?.setValue('0');
      }
      const newValue = [value || '0', `${label}`];
      setFilterState({ relation: filterState.relation, value: newValue });
      onValueChange({ relation: filterState.relation, value: newValue });
    }
  };

  return (
    <ListItemSegmented
      {...props}
      title={title}
      value={undefined} // Prevent propagation of this components props.value
      index={index}
      segments={segments}
      position={
        expanded && position ? lodash.without(position, 'last') : position
      }
      onChangeIndex={onRelationSelect}
      expanded={expanded}
      ExpandableComponent={
        <ListItemInput
          ref={liRef}
          title={'Value'}
          label={label}
          position={position?.includes('last') ? ['last'] : []}
          keyboardType={'number-pad'}
          numeric={true}
          numericProps={numericProps}
          value={
            filterState.value[0]?.length ? filterState.value[0] : undefined
          }
          placeholder={'0'}
          onChangeText={value => setDebounced(() => onChangedFilter(value))}
        />
      }
    />
  );
};

export { ListItemFilterNumber };
