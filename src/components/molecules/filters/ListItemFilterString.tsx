import { ListItem, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StringFilterState, StringRelation } from 'components/molecules/filters';
import { useEffect, useRef, useState } from "react";

import { MultipleNavigatorParamList } from 'types/navigation';
import lodash from 'lodash';
import { useEvent } from 'lib/event';
import { useSetState } from '@react-native-ajp-elements/core';
import {useTheme} from "theme";
import { uuidv4 } from 'lib/utils';

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  onValueChange: (filterState: StringFilterState) => void;
  relation: StringRelation;
  title: string;
  value: string[];
};

const ListItemFilterString = (props: Props) => {
  const {
    onValueChange,
    position,
    title,
  } = props;

  const theme = useTheme();
  const navigation: NavigationProp<MultipleNavigatorParamList> = useNavigation();
  const event = useEvent();

  const segments = [
    StringRelation.Any,
    StringRelation.Contains,
    StringRelation.Missing,
  ];
  
  const initializing = useRef(true);

  const eventName = useRef(`list-item-filter-string-${uuidv4()}`).current;
  const [expanded, setExpanded] = useState(props.value.length > 0);
  const [filterState, setFilterState] = useSetState<StringFilterState>({
    relation: props.relation,
    value: props.value.length ? props.value : [],
  });
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => { return seg === props.relation })
  );

  // Controlled component state changes.
  useEffect(() => {
    if (initializing.current) {
      initializing.current = false;
      return;
    }
    const newIndex = segments.findIndex(seg => { return seg === props.relation });
    setIndex(newIndex);

    if (props.relation !== filterState.relation && props.relation === StringRelation.Any) {
      // Closing
      setExpanded(false);
      setTimeout(() => {
        setFilterState({relation: props.relation, value: props.value}, {assign: true});
      }, 300);
    } else if (props.relation !== filterState.relation && props.relation !== StringRelation.Any) {
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
    const onChangeFilter = (value: string) => {
      // Set our local state and pass the entire state back to the caller.
      setFilterState({value: [value]}, {assign: true});
      onValueChange({relation: filterState.relation, value: [value]});
    };

    // Event handler for Notes
    event.on(eventName, onChangeFilter);

    return () => {
      event.removeListener(eventName, onChangeFilter);
    };
  }, [ filterState.relation ]);
  
  const onRelationSelect = (index: number) => {
    const newRelation = Object.values(StringRelation)[index] as StringRelation;

    // Reset the value of the filter if choosing Any.
    let newValue = filterState.value;
    if (newRelation === StringRelation.Any) {
      newValue = [];
    }

    if (newRelation !== StringRelation.Any) {
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
          title={'The Text'}
          titleStyle={!filterState.value ? {color: theme.colors.assertive}: {}}
          subtitle={!filterState.value.length ?  'Matching text not specified' : filterState.value[0]}
          position={position?.includes('last') ? ['last'] : []}
          onPress={() => navigation.navigate('NotesEditor', {
            title: 'String Value Notes',
            text: filterState.value[0],
            eventName,
          })}
        />
      }
    />
  );
}

export { ListItemFilterString };
