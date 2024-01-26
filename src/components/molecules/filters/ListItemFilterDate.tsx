import { DateFilterState, DateRelation } from 'components/molecules/filters';
import { ListItemDate, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { useRef, useState } from "react";

import { DateTime } from 'luxon';
import { ISODateString } from 'types/common';
import lodash from 'lodash';
import { useTheme } from 'theme';

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  onValueChange: (filterState: DateFilterState) => void;
  relation: DateRelation;
  title: string;
  value: ISODateString[];
};

const ListItemFilterDate = (props: Props) => {
  const theme = useTheme();
  
  const {
    onValueChange,
    position,
    relation: initialRelation,
    title,
    value: initialValue,
  } = props;

  const [expanded, setExpanded] = useState(initialValue.length > 0);
  const [relation, setRelation] = useState<DateRelation>(initialRelation);
  const [value, setValue] = useState(() => {
    return initialValue.length ? initialValue : [DateTime.now().toISO()!]
  });

  const segments = [
    { label: DateRelation.Any, labelStyle: theme.styles.textTiny },
    { label: DateRelation.Before, labelStyle: theme.styles.textTiny },
    { label: DateRelation.After, labelStyle: theme.styles.textTiny },
    { label: DateRelation.Past, labelStyle: theme.styles.textTiny }
  ];

  const initiaIndex = useRef(segments.findIndex(seg => {
    return seg.label === initialRelation
  })).current;

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
    </>
  );
}

export { ListItemFilterDate };
