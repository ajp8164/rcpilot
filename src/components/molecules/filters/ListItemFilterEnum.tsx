import { EnumFilterState, EnumRelation } from 'components/molecules/filters';
import { EnumName, useEnumFilterConfig } from './useEnumFilterConfig';
import {
  ListItem,
  ListItemSegmented,
  ListItemSegmentedInterface,
} from 'components/atoms/List';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';

import { EnumPickerResult } from 'components/EnumPickerScreen';
import { MultipleNavigatorParamList } from 'types/navigation';
import React from 'react';
import lodash from 'lodash';
import { useEvent } from 'lib/event';
import { useTheme } from 'theme';
import { uuidv4 } from 'lib/utils';
import { useRealm } from '@realm/react';
import { BSON } from 'realm';

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
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
  const [expanded, setExpanded] = useState(props.value.length > 0);
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
      setExpanded(false);
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
        setExpanded(true);
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
      } catch (e) {
        // Using exception to determine if value is a valid object id.
      }

      if (objId) {
        // Get the enum names using the filter saved enum id's and specified enumName.
        const obj = realm.objectForPrimaryKey(enumName, objId);
        obj?.name && value.push(obj.name as string);
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
      onValueChange({ relation: newRelation, value: newValue });
      setTimeout(() => {
        setExpanded(true);
      });
    } else {
      // Closing
      setExpanded(false);
      setTimeout(() => {
        setFilterState({ relation: newRelation, value: newValue });
        onValueChange({ relation: newRelation, value: newValue });
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
      position={
        expanded && position ? lodash.without(position, 'last') : position
      }
      onChangeIndex={onRelationSelect}
      expanded={expanded}
      ExpandableComponent={
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
      }
    />
  );
};

export { ListItemFilterEnum };
