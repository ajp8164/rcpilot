import { EnumFilterState, EnumRelation } from 'components/molecules/filters';
import { EnumName, useEnumFilterConfig } from './useEnumFilterConfig';
import { ListItem, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { useEffect, useRef, useState } from "react";

import lodash from 'lodash';
import { useEvent } from 'lib/event';
import { useNavigation } from '@react-navigation/core';
import { useSetState } from '@react-native-ajp-elements/core';
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
    title,
  } = props;

  const theme = useTheme();
  const navigation = useNavigation<any>();
  const event = useEvent();

  const segments = [
    EnumRelation.Any,
    EnumRelation.Is,
    EnumRelation.IsNot
  ];
  
  const initializing = useRef(true);

  const eventName = useRef(`list-item-filter-enum-${uuidv4()}`).current;
  const [expanded, setExpanded] = useState(props.value.length > 0);
  const [filterState, setFilterState] = useSetState<EnumFilterState>({
    relation: props.relation,
    value: props.value.length ? props.value : [],
  });
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => { return seg === props.relation })
  );

  const enumFilterConfig = useEnumFilterConfig(enumName, filterState.relation);

  // Controlled component state changes.
  useEffect(() => {
    if (initializing.current) {
      initializing.current = false;
      return;
    }
    const newIndex = segments.findIndex(seg => { return seg === props.relation });
    setIndex(newIndex);

    if (props.relation !== filterState.relation && props.relation === EnumRelation.Any) {
      // Closing
      setExpanded(false);
      setTimeout(() => {
        setFilterState({relation: props.relation, value: props.value}, {assign: true});
      }, 300);
    } else if (props.relation !== filterState.relation && props.relation !== EnumRelation.Any) {
      // Opening
      setFilterState({relation: props.relation, value: props.value}, {assign: true});
      setTimeout(() => {
        setExpanded(true);
      }, 300);
    } else {
      setFilterState({relation: props.relation, value: props.value}, {assign: true});
    }
  }, [ props.relation, props.value ]);

  useEffect(() => {
    const onChangeFilter = (value: string[]) => {
      // Set our local state and pass the entire state back to the caller.
      setFilterState({value}, {assign: true});
      onValueChange({relation: filterState.relation, value});
    };

    // Event handler for EnumPicker
    event.on(eventName, onChangeFilter);

    return () => {
      event.removeListener(eventName, onChangeFilter);
    };
  }, [ filterState.relation ]);

  const valueToString = () => {
    return filterState.value?.toString().replaceAll(',', ', ').replace(/(, )(?!.*\1)/, ', or ');
  };

  const onRelationSelect = (index: number) => {
    const newRelation = Object.values(EnumRelation)[index] as EnumRelation;

    // Reset the value of the filter if choosing Any.
    let newValue = filterState.value;
    if (newRelation === EnumRelation.Any) {
      newValue = [];
    }

    if (newRelation !== EnumRelation.Any) {
      // Opening
      setFilterState({relation: newRelation, value: newValue}, {assign: true});
      onValueChange({relation: newRelation, value: newValue});
      setTimeout(() => {
        setExpanded(true);
      });
    } else {
      // Closing
      setExpanded(false);
      setTimeout(() => {
        setFilterState({relation: newRelation, value: newValue}, {assign: true});
        onValueChange({relation: newRelation, value: newValue});
      }, 300);
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
        <ListItem
          title={'Any of these values...'}
          titleStyle={filterState.value?.length === 0 ? {color: theme.colors.assertive}: {}}
          subtitle={filterState.value?.length === 0 ?  'None' : valueToString()}
          position={position?.includes('last') ? ['last'] : []}
          onPress={() => navigation.navigate('EnumPicker', {
            ...enumFilterConfig,
            selected: filterState.value,
            eventName,
          })}
        />
      }
    />
  );
}

export { ListItemFilterEnum };
