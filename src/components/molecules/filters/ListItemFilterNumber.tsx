import React, { useEffect, useRef, useState } from 'react';

import {
  InputMethods,
  ListItemSegmented,
  ListItemSegmentedCollapsible,
  ListItemSegmentedCollapsibleMethods,
} from '@react-native-hello/ui';
import { ListItemInput } from 'components/atoms/List';
import {
  NumberFilterState,
  NumberRelation,
  numberRelationText,
} from 'components/molecules/filters';

type NumericProps = {
  placeholder?: string;
  mask?: string;
  units?: string;
};

interface Props extends Pick<ListItemSegmented, 'position'> {
  numericProps?: NumericProps;
  onValueChange: (filterState: NumberFilterState) => void;
  relation: NumberRelation;
  title: string;
  value: string[];
}

const ListItemFilterNumber = (props: Props) => {
  const {
    numericProps = { placeholder: '0', mask: '000', units: '' },
    onValueChange,
    position,
    title,
  } = props;

  const segments = [
    NumberRelation.Any,
    NumberRelation.LT,
    NumberRelation.GT,
    NumberRelation.EQ,
    NumberRelation.NE,
  ];

  const initializing = useRef(true);
  const [filterState, setFilterState] = useState<NumberFilterState>({
    relation: props.relation,
    value: props.value.length ? props.value : [],
  });
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => {
      return seg === props.relation;
    }),
  );

  const collapsibleRef = useRef<ListItemSegmentedCollapsibleMethods>(null);
  const liRef = useRef<InputMethods>(null);

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
      collapsibleRef.current?.close();
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
        collapsibleRef.current?.open();
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
      : ['0', `${numericProps.units}`];

    // Reset the value of the filter if choosing Any.
    if (newRelation === NumberRelation.Any) {
      newValue = [];
    }

    if (newRelation !== NumberRelation.Any) {
      // Opening
      setFilterState({ relation: newRelation, value: newValue });
      onValueChange({ relation: newRelation, value: newValue });
      setTimeout(() => {
        collapsibleRef.current?.open();
      });
    } else {
      // Closing
      collapsibleRef.current?.close();
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
    if (collapsibleRef.current?.isOpen()) {
      if (value === undefined) {
        // liRef.current?.setValue('0');
        liRef.current?.setText('0');
      }
      const newValue = [value || '0', `${numericProps.units}`];
      setFilterState({ relation: filterState.relation, value: newValue });
      onValueChange({ relation: filterState.relation, value: newValue });
    }
  };

  return (
    <ListItemSegmentedCollapsible
      ref={collapsibleRef}
      {...props}
      title={title}
      value={undefined} // Prevent propagation of this components props.value
      index={index}
      segments={segments}
      initExpanded={props.value.length > 0}
      onChangeIndex={onRelationSelect}>
      <ListItemInput
        ref={liRef}
        title={numberRelationText[filterState.relation]}
        position={position?.includes('last') ? ['last'] : []}
        units={numericProps.units}
        container={'right'}
        inputProps={{
          onChangeText: (_, unformatted) => onChangedFilter(unformatted),
          value: filterState.value[0]?.length ? filterState.value[0] : '',
          placeholder: numericProps.placeholder,
          mask: numericProps.mask,
          rtlNumber: true,
          keyboardType: 'number-pad',
        }}
      />
    </ListItemSegmentedCollapsible>
  );
};

export { ListItemFilterNumber };
