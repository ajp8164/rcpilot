import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppTheme, useTheme } from 'theme';
import { DateFilterState, DateRelation } from 'components/molecules/filters';
import { ListItem, ListItemDate, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { useEffect, useRef, useState } from "react";

import { DateTime } from 'luxon';
import { ISODateString } from 'types/common';
import WheelPicker from 'components/atoms/WheelPicker';
import { getTimeSpanItems } from 'lib/relativeDate';
import lodash from 'lodash';
import { makeStyles } from '@rneui/themed';
import { useSetState } from '@react-native-ajp-elements/core';

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  onValueChange: (filterState: DateFilterState) => void;
  relation: DateRelation;
  title: string;
  value: ISODateString[];
};

const ListItemFilterDate = (props: Props) => {  
  const {
    onValueChange,
    position,
    title,
  } = props;

  const theme = useTheme();
  const s = useStyles(theme);

  const segments = [
    DateRelation.Any,
    DateRelation.Before,
    DateRelation.After,
    DateRelation.Past,
  ];

  const initializing = useRef(true);
  const [expanded, setExpanded] = useState(props.value.length > 0);
  const [filterState, setFilterState] = useSetState<DateFilterState>({
    relation: props.relation,
    value: props.value.length ? props.value : [],
  });
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => { return seg === props.relation })
  );

  const [pickerExpanded, setPickerExpanded] = useState(false);
  const initialInThePastItems = useRef(getTimeSpanItems()).current;
  const inThePastPickerItems = useRef(initialInThePastItems.items);
  const inThePastPickerValue = useRef<string[]>(
    props.value.length > 0 ? props.value : initialInThePastItems.default.items
  );

  // Controlled component state changes.
  useEffect(() => {
    if (initializing.current) {
      initializing.current = false;
      return;
    }
    const newIndex = segments.findIndex(seg => { return seg === props.relation });
    setIndex(newIndex);

    if (props.relation !== filterState.relation && props.relation === DateRelation.Any) {
      // Closing
      setExpanded(false);
      setTimeout(() => {
        setFilterState({relation: props.relation, value: props.value});
        setPickerExpanded(false);
      }, 300);
    } else if (props.relation !== filterState.relation && props.relation !== DateRelation.Any) {
      // Opening
      setFilterState({relation: props.relation, value: props.value});
      setTimeout(() => {
        setExpanded(true);
      }, 300);
    } else {
      setFilterState({relation: props.relation, value: props.value});
    }
  }, [ props.relation, props.value ]);
  
  const onRelationSelect = (index: number) => {
    const newRelation = Object.values(DateRelation)[index] as DateRelation;
    let newValue: string[];
    
    if (newRelation === DateRelation.Any) {
      newValue = [] as string[];
    } else if (newRelation === DateRelation.Past) {
      newValue = initialInThePastItems.default.items;
      inThePastPickerValue.current = newValue;
    } else if (filterState.value.length === 0 || !DateTime.isDateTime(filterState.value[0])) {
      newValue = [DateTime.now().toISO()!];
    } else {
      newValue = filterState.value;
    }

    if (newRelation !== DateRelation.Any) {
      // Opening
      setFilterState({relation: newRelation, value: newValue});
      onValueChange({relation: newRelation, value: newValue});
      setTimeout(() => {
        setExpanded(true);
      });
    } else {
      // Closing
      setExpanded(false);
      setTimeout(() => {
        setFilterState({relation: newRelation, value: newValue});
        onValueChange({relation: newRelation, value: newValue});
        setPickerExpanded(false);
      }, 300);
    }
  };

  const onDateChange = (date?: Date | undefined) => {
    // Set our local state and pass the entire state back to the caller.
    const value = date && DateTime.fromJSDate(date).toISO() || '';
    setFilterState({value: [value]});
    onValueChange({relation: filterState.relation, value: [value]});
  };
  
  const onInThePastChange = (itpValue: string[]) => {
    // Set our local state and pass the entire state back to the caller.
    inThePastPickerValue.current = itpValue;
    setFilterState({value: itpValue});
    onValueChange({relation: filterState.relation, value: itpValue});
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
        filterState.relation === DateRelation.After || filterState.relation === DateRelation.Before
        ?
          <ListItemDate
            title={'Date'}
            value={DateTime.fromISO(filterState.value[0]).toFormat("MMM d, yyyy 'at' hh:mm a")}
            rightImage={false}
            onPress={() => setPickerExpanded(!pickerExpanded)}
            expanded={pickerExpanded}
            expandableContainerStyle={s.datePickerExpandableContainer}
            datePickerContainerStyle={s.datePickerContainer}
            position={position?.includes('last') ? ['last'] : []}
            onDateChange={onDateChange}
            pickerValue={filterState.value[0]}
          />
        : filterState.relation === DateRelation.Past
        ?
          <ListItem
            title={'In Past'}
            value={
              parseInt(inThePastPickerValue.current[0]) === 1 ?
                inThePastPickerValue.current.join(' ').slice(0, -1) :
                inThePastPickerValue.current.join(' ')
            }
            position={pickerExpanded ? [] : ['last']}
            rightImage={false}
            onPress={() => setPickerExpanded(!pickerExpanded)}
            expanded={pickerExpanded}
            ExpandableComponent={
              <Animated.View entering={FadeIn} exiting={FadeOut} style={[
                s.pastPicker,
                props.position?.includes('last') ? s.pastExpandableContainer : {},
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
        : <></>
      }
    />
  );
}

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
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
  },
}));

export { ListItemFilterDate };
