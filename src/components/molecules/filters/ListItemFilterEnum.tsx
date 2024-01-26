import { EnumFilterState, EnumRelation } from 'components/molecules/filters';
import { EnumName, useEnumFilterConfig } from './useEnumFilterConfig';
import { ListItem, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { useEffect, useRef, useState } from "react";

import lodash from 'lodash';
import { useEvent } from 'lib/event';
import { useNavigation } from '@react-navigation/core';
import {useTheme} from "theme";
import { uuidv4 } from 'lib/utils';

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  onValueChange: (filterState: EnumFilterState) => void;
  enumName: EnumName;
  relation: EnumRelation;
  title: string;
  value: string[];
};

const ListItemFilterEnum = (props: Props) => {
  const {
    onValueChange,
    enumName,
    position,
    relation: initialRelation,
    title,
    value: initialValue,
  } = props;

  const theme = useTheme();
  const navigation = useNavigation<any>();
  const event = useEvent();

  const eventName = useRef(`list-item-filter-enum-${uuidv4()}`).current;
  const [expanded, setExpanded] = useState(initialValue.length > 0);
  const [relation, setRelation] = useState<EnumRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const enumFilterConfig = useEnumFilterConfig(enumName, relation);

  const segments = [
    { label: EnumRelation.Any, labelStyle: theme.styles.textTiny },
    { label: EnumRelation.Is, labelStyle: theme.styles.textTiny },
    { label: EnumRelation.IsNot, labelStyle: theme.styles.textTiny }
  ];

  const initiaIndex = useRef(segments.findIndex(seg => {
    return seg.label === initialRelation
  })).current;

  useEffect(() => {
    const onChangeFilter = (value: string[]) => {
      // Set our local state and pass the entire state back to the caller.
      setValue(value);
      onValueChange({relation, value});
    };

    // Event handler for EnumPicker
    event.on(eventName, onChangeFilter);

    return () => {
      event.removeListener(eventName, onChangeFilter);
    };
  }, [ relation ]);

  const valueToString = () => {
    return value?.toString().replaceAll(',', ', ').replace(/(, )(?!.*\1)/, ', or ');
  };

  const onRelationSelect = (index: number) => {
    const newRelation = Object.values(EnumRelation)[index] as EnumRelation;
    setRelation(newRelation);

    // Reset the value of the filter if choosing Any.
    let newValue = value;
    if (newRelation === EnumRelation.Any) {
      newValue = [];
      setValue(newValue);
    }
    
    onValueChange({relation: newRelation, value: newValue});
    setExpanded(index > 0);
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
          <ListItem
            title={'Any of these values...'}
            titleStyle={value?.length === 0 ? {color: theme.colors.assertive}: {}}
            subtitle={value?.length === 0 ?  'None' : valueToString()}
            position={position?.includes('last') ? ['last'] : []}
            onPress={() => navigation.navigate('EnumPicker', {
              ...enumFilterConfig,
              selected: value,
              eventName: eventName,
            })}
          />
        }
      />
    </>
  );
}

export { ListItemFilterEnum };
