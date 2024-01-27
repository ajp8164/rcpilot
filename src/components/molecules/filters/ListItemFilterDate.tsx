import { DateFilterState, DateRelation } from 'components/molecules/filters';
import { ListItem, ListItemDate, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { useEffect, useRef, useState } from "react";

import { DateTime } from 'luxon';
import { ISODateString } from 'types/common';
import WheelPicker from 'components/atoms/WheelPicker';
import { getTimeSpanItems } from 'lib/relativeDate';
import lodash from 'lodash';

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

  const segments = [
    DateRelation.Any,
    DateRelation.Before,
    DateRelation.After,
    DateRelation.Past,
  ];

  const initializing = useRef(true);

  const [expanded, setExpanded] = useState(props.value.length > 0);
  const [relation, setRelation] = useState<DateRelation>(props.relation);
  const [value, setValue] = useState(() => {
    return props.value.length ? props.value : [DateTime.now().toISO()!]
  });
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => { return seg === props.relation })
  );

  const initialInThePastItems = useRef(getTimeSpanItems()).current;
  const inThePastPickerItems = useRef(initialInThePastItems.items);
  const [inThePastPickerValue, setInThePastPickerValue] = useState<string[]>(initialInThePastItems.default.items);
  const [inThePastPickerExpanded, setInThePastPickerExpanded] = useState(false);



  // Controlled component state changes.
  useEffect(() => {
    if (initializing.current) {
      initializing.current = false;
      return;
    }
    const newIndex = segments.findIndex(seg => { return seg === props.relation });
    setIndex(newIndex);
    setRelation(props.relation);
    setTimeout(() => {
      setValue(props.value);
    }, 500); // Allows expanded animation to complete before possibly setting value to [].
    setExpanded(newIndex > 0);
  }, [ props.relation, props.value ]);
  
  const onRelationSelect = (index: number) => {
    const newRelation = Object.values(DateRelation)[index] as DateRelation;
    setRelation(newRelation);

    let v = value;
    if (index > 0 && v.length === 0) {
      v = [DateTime.now().toISO()!];
    }
    
    onValueChange({relation: newRelation, value: v});
    setValue(v);
    setExpanded(index > 0);
  };

  const onChangedFilter = (date?: Date | undefined) => {
    // Set our local state and pass the entire state back to the caller.
    const value = date && DateTime.fromJSDate(date).toISO() || '';
    setValue([value]);
    onValueChange({relation, value: [value]});
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
        relation !== DateRelation.Past
        ?
          <ListItemDate
            title={'Date'}
            value={DateTime.fromISO(value[0]).toFormat("MMM d, yyyy 'at' hh:mm a")}
            rightImage={false}
            expanded={true}
            position={position?.includes('last') ? ['last'] : []}
            onDateChange={onChangedFilter}
            pickerValue={value[0]}
          />
        : 
          <ListItem
            title={'In Past'}
            value={inThePastPickerValue.join(' ')}
            position={inThePastPickerExpanded ? [] : ['last']}
            rightImage={false}
            onPress={() => setInThePastPickerExpanded(!inThePastPickerExpanded)}
            expanded={inThePastPickerExpanded}
            ExpandableComponent={
              // Wheel index 0 is value, wheel index 1 is time span.
              <WheelPicker
                placeholder={'none'}
                itemWidth={['40%', '60%']}
                wheelVisible={[true, true]}
                items={inThePastPickerItems.current}
                // value={inThePastPickerValue}
                onValueChange={(_wheelIndex, value, _index) => {
                  setInThePastPickerValue(value as string[]);
                }}
              />
            }
          />
      }
    />
  );
}

export { ListItemFilterDate };
