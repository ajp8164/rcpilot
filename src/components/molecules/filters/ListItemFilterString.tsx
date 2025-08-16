import { useSetState } from '@react-native-hello/core';
import { ListItem, ListItemSegmented, useTheme } from '@react-native-hello/ui';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import {
  ListItemSegmentedCollapsible,
  ListItemSegmentedCollapsibleMethods,
} from 'components/atoms/List';
import {
  StringFilterState,
  StringRelation,
} from 'components/molecules/filters';
import { useEvent } from 'lib/event';
import { uuidv4 } from 'lib/utils';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { MultipleNavigatorParamList } from 'types/navigation';

interface Props extends Pick<ListItemSegmented, 'position'> {
  onValueChange: (filterState: StringFilterState) => void;
  relation: StringRelation;
  title: string;
  value: string[];
}

const ListItemFilterString = (props: Props) => {
  const { onValueChange, position, title } = props;

  const theme = useTheme();
  const navigation: NavigationProp<MultipleNavigatorParamList> =
    useNavigation();
  const event = useEvent();

  const segments = [
    StringRelation.Any,
    StringRelation.Contains,
    StringRelation.Missing,
  ];

  const initializing = useRef(true);
  const eventName = useRef(`list-item-filter-string-${uuidv4()}`).current;
  const [filterState, setFilterState] = useSetState<StringFilterState>({
    relation: props.relation,
    value: props.value.length ? props.value : [],
  });
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => {
      return seg === props.relation;
    }),
  );

  const collapsibleRef = useRef<ListItemSegmentedCollapsibleMethods>(null);

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
      props.relation === StringRelation.Any
    ) {
      // Closing
      collapsibleRef.current?.close();
      setTimeout(() => {
        setFilterState(
          { relation: props.relation, value: props.value },
          { assign: true },
        );
      }, 300);
    } else if (
      props.relation !== filterState.relation &&
      props.relation !== StringRelation.Any
    ) {
      // Opening
      setFilterState(
        { relation: props.relation, value: props.value },
        { assign: true },
      );
      setTimeout(() => {
        collapsibleRef.current?.open();
      }, 300);
    } else {
      setFilterState(
        { relation: props.relation, value: props.value },
        { assign: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.relation, props.value]);

  useEffect(() => {
    const onChangeFilter = (result: NotesEditorResult) => {
      // Set our local state and pass the entire state back to the caller.
      setFilterState({ value: [result.text] }, { assign: true });
      onValueChange({ relation: filterState.relation, value: [result.text] });
    };

    // Event handler for Notes
    event.on(eventName, onChangeFilter);

    return () => {
      event.removeListener(eventName, onChangeFilter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState.relation]);

  const onRelationSelect = (index: number) => {
    const newRelation = Object.values(StringRelation)[index] as StringRelation;

    // Reset the value of the filter if choosing Any.
    let newValue = filterState.value;
    if (newRelation === StringRelation.Any) {
      newValue = [];
    }

    if (newRelation !== StringRelation.Any) {
      // Opening
      setFilterState(
        { relation: newRelation, value: newValue },
        { assign: true },
      );
      onValueChange({ relation: newRelation, value: newValue });
      setTimeout(() => {
        collapsibleRef.current?.open();
      });
    } else {
      // Closing
      collapsibleRef.current?.close();
      setTimeout(() => {
        setFilterState(
          { relation: newRelation, value: newValue },
          { assign: true },
        );
        onValueChange({ relation: newRelation, value: newValue });
      }, 300);
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
      <ListItem
        title={'The Text'}
        titleStyle={
          !filterState.value.length ? { color: theme.colors.assertive } : {}
        }
        subtitle={
          !filterState.value.length
            ? 'Matching text not specified'
            : filterState.value[0]
        }
        position={position?.includes('last') ? ['last'] : []}
        onPress={() =>
          navigation.navigate('NotesEditor', {
            title: 'String Value Notes',
            text: filterState.value[0],
            eventName,
          })
        }
      />
    </ListItemSegmentedCollapsible>
  );
};

export { ListItemFilterString };
