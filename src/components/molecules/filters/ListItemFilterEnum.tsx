import { EnumName, useEnumFilterConfig } from './useEnumFilterConfig';
import { ListItem, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';
import { useEffect, useState } from "react";

import lodash from 'lodash';
import { useEvent } from 'lib/event';
import { useNavigation } from '@react-navigation/core';
import {useTheme} from "theme";

export type EnumFilter = {
  relation: EnumRelation;
  value: string;
};

export enum EnumRelation {
  Any = 'Any',
  Is = 'Is',
  IsNot = 'Is Not',
};

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  onValueChange: (relation: EnumRelation, value: string) => void;
  enumName: EnumName;
  relation?: EnumRelation;
  title: string;
  value: string | string[];
};

const ListItemFilterEnum = (props: Props) => {
  const {
    onValueChange,
    enumName,
    position,
    relation: initialRelation = EnumRelation.Any,
    title,
    value: initialValue,
    } = props;

  const theme = useTheme();
  const navigation = useNavigation<any>();
  const event = useEvent();

  const [expanded, setExpanded] = useState(false);
  const [relation, setRelation] = useState<EnumRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const enumFilterConfig = useEnumFilterConfig(enumName, relation);

  useEffect(() => {
    // Event handler for EnumPicker
    event.on('list-item-filter-enum', onChangeFilter);

    return () => {
      event.removeListener('list-item-filter-enum', onChangeFilter);
    };
  }, []);

  const valueToString = () => {
    return value.toString().replaceAll(',', ', ').replace(/(, )(?!.*\1)/, ', or ')
  };

  const onRelationSelect = (index: number) => {
    setRelation(Object.keys(EnumRelation)[index] as EnumRelation);
    setExpanded(index > 0);
  };

  const onChangeFilter = (value: string) => {
    // Set our local state and pass the entire state back to the caller.
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
          { label: EnumRelation.Any, labelStyle: theme.styles.textTiny },
          { label: EnumRelation.Is, labelStyle: theme.styles.textTiny },
          { label: EnumRelation.IsNot, labelStyle: theme.styles.textTiny }
        ]}
        position={expanded && position ? lodash.without(position, 'last') : position}
        onChangeIndex={onRelationSelect}
        expanded={expanded}
        ExpandableComponent={
          <ListItem
            title={'Any of these values...'}
            titleStyle={!value ? {color: theme.colors.assertive}: {}}
            subtitle={!value ?  'None' : valueToString()}
            position={position?.includes('last') ? ['last'] : []}
            onPress={() => navigation.navigate('EnumPicker', {
              ...enumFilterConfig,
              selected: value,
              eventName: 'list-item-filter-enum',
            })}
          />
        }
      />
    </>
  );
}

export { ListItemFilterEnum };
