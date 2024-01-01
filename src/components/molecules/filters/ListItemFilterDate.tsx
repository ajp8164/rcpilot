import { ListItemDate, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';

import { DateTime } from 'luxon';
import { ISODateString } from 'types/common';
import lodash from 'lodash';
import { useState } from "react";
import { useTheme } from 'theme';

export type DateFilter = {
  relation: DateRelation;
  value: string;
};

export enum DateRelation {
  Any = 'Any',
  Before = 'Before',
  After = 'After',
  Past = 'Past',
};

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  onValueChange: (relation: DateRelation, value: ISODateString) => void;
  relation?: DateRelation;
  title: string;
  value: ISODateString;
};

const ListItemFilterDate = (props: Props) => {
  const theme = useTheme();
  
  const {
    onValueChange,
    position,
    relation: initialRelation = DateRelation.Any,
    title,
    value: initialValue,
    } = props;

  const [expanded, setExpanded] = useState(false);
  const [relation, setRelation] = useState<DateRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const onRelationSelect = (index: number) => {
    setRelation(Object.keys(DateRelation)[index] as DateRelation);
    setExpanded(index > 0);
  };

  const onChangedFilter = (date?: Date | undefined) => {
    // Set our local state and pass the entire state back to the caller.
    const value = date && DateTime.fromJSDate(date).toISO() || '';
    setValue(value);
    onValueChange(relation, value);
  };    

  return (
    <>
      <ListItemSegmented
        {...props}
        title={title}
        value={''}
        segments={[
          { label: DateRelation.Any, labelStyle: theme.styles.textTiny  },
          { label: DateRelation.Before, labelStyle: theme.styles.textTiny  },
          { label: DateRelation.After, labelStyle: theme.styles.textTiny  },
          { label: DateRelation.Past, labelStyle: theme.styles.textTiny  }
        ]}
        position={expanded && position ? lodash.without(position, 'last') : position}
        onChangeIndex={onRelationSelect}
        expanded={expanded}
        ExpandableComponent={
          <ListItemDate
            title={'Date'}
            value={value
              ? DateTime.fromISO(value).toFormat("MMM d, yyyy 'at' hh:mm a")
              : 'Tap to Set...'}
            rightImage={false}
            expanded={true}
            position={position?.includes('last') ? ['last'] : []}
            onDateChange={onChangedFilter}
            pickerValue={value}
          />
        }
      />
    </>
  );
}

export { ListItemFilterDate };
