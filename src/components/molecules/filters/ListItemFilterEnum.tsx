import { ListItem, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';

import lodash from 'lodash';
import { useNavigation } from '@react-navigation/core';
import { useState } from "react";
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
  pickerScreen: string;
  relation?: EnumRelation;
  title: string;
  value: string;
};

const ListItemFilterEnum = (props: Props) => {
  const {
    onValueChange,
    pickerScreen,
    position,
    relation: initialRelation = EnumRelation.Any,
    title,
    value: initialValue,
    } = props;

  const theme = useTheme();
  const navigation = useNavigation<any>();

  const [expanded, setExpanded] = useState(false);
  const [relation, setRelation] = useState<EnumRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const onRelationSelect = (index: number) => {
    setRelation(Object.keys(EnumRelation)[index] as EnumRelation);
    setExpanded(index > 0);
  };

  const onChangedFilter = (value: string) => {
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
        segments={[{ label: EnumRelation.Any }, { label: EnumRelation.Is }, { label: EnumRelation.IsNot }]}
        position={expanded && position ? lodash.without(position, 'last') : position}
        onChangeIndex={onRelationSelect}
        expanded={expanded}
        ExpandableComponent={
          <ListItem
            title={'Any of these values...'}
            titleStyle={!value ? {color: theme.colors.assertive}: {}}
            subtitle={!value ?  'None' : value}
            position={position?.includes('last') ?  ['last'] : []}
            onPress={() => navigation.navigate(pickerScreen)}
          />
        }
      />
    </>
  );
}

export { ListItemFilterEnum };
