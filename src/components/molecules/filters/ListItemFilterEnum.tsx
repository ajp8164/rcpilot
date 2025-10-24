import React, { useEffect, useRef, useState } from 'react';

import { useEvent } from '@react-native-hello/core';
import { ListItem, ListItemSegmented, useTheme } from '@react-native-hello/ui';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRealm } from '@realm/react';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import {
  ListItemSegmentedCollapsible,
  ListItemSegmentedCollapsibleMethods,
} from 'components/atoms/List/ListItemSegmentedCollapsible';
import { EnumFilterState, EnumRelation } from 'components/molecules/filters';
import { uuidv4 } from 'lib/utils';
import { BSON } from 'realm';
import { MultipleNavigatorParamList } from 'types/navigation';

import { EnumName, useEnumFilterConfig } from './useEnumFilterConfig';

interface Props extends Pick<ListItemSegmented, 'position'> {
  onValueChange: (filterState: EnumFilterState) => void;
  enumName: EnumName;
  relation: EnumRelation;
  title: string;
  value: string[];
}

const ListItemFilterEnum = (props: Props) => {
  const { onValueChange, enumName, position, title } = props;

  const theme = useTheme();
  const navigation: NavigationProp<MultipleNavigatorParamList> =
    useNavigation();
  const event = useEvent();
  const realm = useRealm();

  const segments = [EnumRelation.Any, EnumRelation.Is, EnumRelation.IsNot];

  const initializing = useRef(true);
  const eventName = useRef(`list-item-filter-enum-${uuidv4()}`).current;
  const [filterState, setFilterState] = useState<EnumFilterState>({
    relation: props.relation,
    value: props.value.length ? props.value : [],
  });
  const [index, setIndex] = useState(() =>
    segments.findIndex(seg => {
      return seg === props.relation;
    }),
  );

  const enumFilterConfig = useEnumFilterConfig(enumName, filterState.relation);

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
      props.relation === EnumRelation.Any
    ) {
      // Closing (moving relation to Any)
      collapsibleRef.current?.close();
      setTimeout(() => {
        setFilterState({ relation: props.relation, value: props.value });
      }, 300);
    } else if (
      props.relation !== filterState.relation &&
      props.relation !== EnumRelation.Any
    ) {
      // Opening (moving relation to something other than Any)
      setFilterState({ relation: props.relation, value: props.value });
      setTimeout(() => {
        collapsibleRef.current?.open();
      }, 300);
    } else {
      setFilterState({ relation: props.relation, value: props.value });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.relation, props.value]);

  useEffect(() => {
    const onChangeFilter = (result: EnumPickerResult) => {
      // Set our local state and pass the entire state back to the caller.
      setFilterState({ relation: filterState.relation, value: result.value });
      onValueChange({ relation: filterState.relation, value: result.value });
    };

    // Event handler for EnumPicker
    event.on(eventName, onChangeFilter);

    return () => {
      event.removeListener(eventName, onChangeFilter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState.relation]);

  const valueToString = () => {
    const value: string[] = [];
    filterState.value.forEach(v => {
      let objId;
      try {
        objId = new BSON.ObjectId(new BSON.ObjectId(v));
      } catch {
        // Using exception to determine if value is a valid object id.
      }

      if (objId) {
        // Get the enum names using the filter saved enum id's and specified enumName.
        const obj = realm.objectForPrimaryKey(enumName, objId);
        if (obj?.name) value.push(obj.name as string);
      } else {
        // Not a database enum, use the enum value in place of an id.
        value.push(v);
      }
    });

    return value
      ?.toString()
      .replaceAll(',', ', ')
      .replace(/(, )(?!.*\1)/, ', or ');
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
      setFilterState({ relation: newRelation, value: newValue });
      // Notify relation changed only of values are selected. Avoids a filter setting
      // with a relation and no value(s).
      if (newValue.length) {
        onValueChange({ relation: newRelation, value: newValue });
      }

      setTimeout(() => {
        collapsibleRef.current?.open();
      });
    } else {
      // Closing
      collapsibleRef.current?.close();
      setTimeout(() => {
        setFilterState({ relation: newRelation, value: newValue });
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
      initExpanded={filterState.value?.length > 0}
      onChangeIndex={onRelationSelect}>
      <ListItem
        title={'Any of these values...'}
        titleStyle={
          filterState.value?.length === 0
            ? { color: theme.colors.assertive }
            : {}
        }
        subtitle={filterState.value?.length === 0 ? 'None' : valueToString()}
        position={position?.includes('last') ? ['last'] : []}
        onPress={() =>
          navigation.navigate('EnumPicker', {
            ...enumFilterConfig,
            selected: filterState.value,
            eventName,
          })
        }
      />
    </ListItemSegmentedCollapsible>
  );
};

export { ListItemFilterEnum };
