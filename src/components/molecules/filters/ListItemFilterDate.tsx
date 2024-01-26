import { DateFilterState, DateRelation } from 'components/molecules/filters';
import { ListItemDate, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { useEffect, useState } from "react";

import { DateTime } from 'luxon';
import { ISODateString } from 'types/common';
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
  
  const [expanded, setExpanded] = useState(props.value.length > 0);
  const [relation, setRelation] = useState<DateRelation>(props.relation);
  const [value, setValue] = useState(() => {
    return props.value.length ? props.value : [DateTime.now().toISO()!]
  });
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => { return seg === props.relation })
  );

  // Controlled component state changes.
  useEffect(() => {
    const newIndex = segments.findIndex(seg => { return seg === props.relation });
    setIndex(newIndex);
    setRelation(props.relation);
    setValue(props.value);
    setExpanded(newIndex > 0);
  }, [ props.relation, props.value ]);
  
  const onRelationSelect = (index: number) => {
    const newRelation = Object.values(DateRelation)[index] as DateRelation;
    setRelation(newRelation);
    onValueChange({relation: newRelation, value});
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
        <ListItemDate
          title={'Date'}
          value={DateTime.fromISO(value[0]).toFormat("MMM d, yyyy 'at' hh:mm a")}
          rightImage={false}
          expanded={true}
          position={position?.includes('last') ? ['last'] : []}
          onDateChange={onChangedFilter}
          pickerValue={value[0]}
        />
      }
    />
  );
}

export { ListItemFilterDate };
