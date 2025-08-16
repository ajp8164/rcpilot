import { getTimeSpanItems } from './wheelPickerHelpers';
import { useSetState } from '@react-native-hello/core';
import {
  ListItemDateTime,
  ListItemSegmented,
  ThemeManager,
  WheelPicker,
} from '@react-native-hello/ui';
import {
  ListItemSegmentedCollapsible,
  ListItemSegmentedCollapsibleMethods,
} from 'components/atoms/List';
import { DateFilterState, DateRelation } from 'components/molecules/filters';
import { DateTime } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ISODateString } from 'types/common';

interface Props extends Pick<ListItemSegmented, 'position'> {
  onValueChange: (filterState: DateFilterState) => void;
  relation: DateRelation;
  title: string;
  value: ISODateString[];
}

const ListItemFilterDate = (props: Props) => {
  const { onValueChange, position, title } = props;

  const s = useStyles();

  const segments = [
    DateRelation.Any,
    DateRelation.Before,
    DateRelation.After,
    DateRelation.Past,
  ];

  const initializing = useRef(true);
  const [filterState, setFilterState] = useSetState<DateFilterState>({
    relation: props.relation,
    value: props.value.length ? props.value : [],
  });
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => {
      return seg === props.relation;
    }),
  );

  const initialInThePastItems = useRef(getTimeSpanItems()).current;
  const inThePastPickerItems = useRef(initialInThePastItems.items);
  const inThePastPickerValue = useRef<string[]>(
    props.value.length > 0 ? props.value : initialInThePastItems.default.items,
  );

  const collapsibleRef = useRef<ListItemSegmentedCollapsibleMethods>(null);
  const [pickerExpanded, setPickerExpanded] = useState(false);

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
      props.relation === DateRelation.Any
    ) {
      // Closing
      collapsibleRef.current?.close();
      setTimeout(() => {
        setFilterState({ relation: props.relation, value: props.value });
        setPickerExpanded(false);
      }, 300);
    } else if (
      props.relation !== filterState.relation &&
      props.relation !== DateRelation.Any
    ) {
      // Opening
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
    const newRelation = Object.values(DateRelation)[index] as DateRelation;
    let newValue: string[];

    if (newRelation === DateRelation.Any) {
      newValue = [] as string[];
    } else if (newRelation === DateRelation.Past) {
      newValue = initialInThePastItems.default.items;
      inThePastPickerValue.current = newValue;
    } else if (
      filterState.value.length === 0 ||
      !DateTime.isDateTime(filterState.value[0])
    ) {
      newValue = [DateTime.now().toISO()];
    } else {
      newValue = filterState.value;
    }

    if (newRelation !== DateRelation.Any) {
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
        setPickerExpanded(false);
      }, 300);
    }
  };

  const onDateChange = (date?: Date | undefined) => {
    // Set our local state and pass the entire state back to the caller.
    const value = (date && DateTime.fromJSDate(date).toISO()) || '';
    setFilterState({ value: [value] });
    onValueChange({ relation: filterState.relation, value: [value] });
  };

  const onInThePastChange = (itpValue: string[]) => {
    // Set our local state and pass the entire state back to the caller.
    inThePastPickerValue.current = itpValue;
    setFilterState({ value: itpValue });
    onValueChange({ relation: filterState.relation, value: itpValue });
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
      <>
        {filterState.relation !== DateRelation.Any ? (
          <ListItemDateTime
            title={
              filterState.relation === DateRelation.Past
                ? 'In Past'
                : filterState.relation === DateRelation.After
                  ? 'After'
                  : 'Before'
            }
            value={
              filterState.relation === DateRelation.Past
                ? parseInt(inThePastPickerValue.current[0], 10) === 1
                  ? inThePastPickerValue.current.join(' ').slice(0, -1)
                  : inThePastPickerValue.current.join(' ')
                : DateTime.fromISO(filterState.value[0]).toFormat(
                    "MMM d, yyyy 'at' h:mm a",
                  )
            }
            expanded={pickerExpanded}
            onPress={() => setPickerExpanded(!pickerExpanded)}
            expandableContainerStyle={s.datePickerExpandableContainer}
            datePickerContainerStyle={s.datePickerContainer}
            position={position?.includes('last') ? ['last'] : []}
            onChange={onDateChange}
            pickerValue={filterState.value[0]}
            mode={
              filterState.relation === DateRelation.Past ? 'custom' : 'datetime'
            }
            customContent={
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={[
                  s.pastPicker,
                  props.position?.includes('last')
                    ? s.pastExpandableContainer
                    : {},
                ]}>
                {/* Wheel index 0 is value, wheel index 1 is time span. */}
                <WheelPicker
                  placeholder={'none'}
                  itemWidth={['40%', '50%']}
                  wheelVisible={[true, true]}
                  items={inThePastPickerItems.current}
                  value={inThePastPickerValue.current}
                  onValueChange={(_wheelIndex, value, _index) => {
                    onInThePastChange(value as string[]);
                  }}
                />
              </Animated.View>
            }
          />
        ) : (
          <></>
        )}
      </>
    </ListItemSegmentedCollapsible>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  datePickerContainer: {
    height: 200,
  },
  datePickerExpandableContainer: {
    backgroundColor: theme.colors.listItem,
  },
  pastPicker: {
    height: 200,
  },
  pastExpandableContainer: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    backgroundColor: theme.colors.listItem,
    justifyContent: 'center',
    width: '100%',
  },
}));

export { ListItemFilterDate };
