import { ListItem, ListItemSegmented, ListItemSegmentedInterface } from 'components/atoms/List';

import lodash from 'lodash';
import { useNavigation } from '@react-navigation/core';
import { useState } from "react";
import {useTheme} from "theme";

export type StringFilter = {
  relation: StringRelation;
  value: string;
};

export enum StringRelation {
  Any = 'Any',
  Contains = 'Contains',
  Missing = 'Missing',
};

/**
 * const [filter, setFilter] = useState<StringFilter>({
 *   relation: filterRelation,
 *   value: notes
 * });
 * 
 * <ListItemFilterString
 *   title={'Notes'}
 *   value={notes}
 *   relation={filter.relation}
 *   onValueChange={(relation, value) => {
 *     setFilter({relation, value});
 *   });
 * />
 * 
 * 
 */

interface Props extends Pick<ListItemSegmentedInterface, 'position'> {
  onValueChange: (relation: StringRelation, value: string) => void;
  relation?: StringRelation;
  title: string;
  value: string;
};

const ListItemFilterString = (props: Props) => {
  const {
    onValueChange,
    position,
    relation: initialRelation = StringRelation.Any,
    title,
    value: initialValue,
    } = props;

  const theme = useTheme();
  const navigation = useNavigation<any>();

  // const notesRef = useRef<TextModal>(null);
  const [expanded, setExpanded] = useState(false);
  const [relation, setRelation] = useState<StringRelation>(initialRelation);
  const [value, setValue] = useState(initialValue);

  const onRelationSelect = (index: number) => {
    setRelation(Object.keys(StringRelation)[index] as StringRelation);
    setExpanded(index > 0);
  };

  // const onDismiss = (text: string) => {
  const onChangedFilter = (text: string) => {
    // Set our local state and pass the entire state back to the caller.
    setValue(text);
    onValueChange(relation, text);
  };    

  return (
    <>
      <ListItemSegmented
        {...props}
        title={title}
        value={''}
        segments={[
          { label: StringRelation.Any, labelStyle: theme.styles.textTiny },
          { label: StringRelation.Contains, labelStyle: theme.styles.textTiny },
          { label: StringRelation.Missing, labelStyle: theme.styles.textTiny }
        ]}
        position={expanded && position ? lodash.without(position, 'last') : position}
        onChangeIndex={onRelationSelect}
        expanded={expanded}
        ExpandableComponent={
          <ListItem
            title={'The Text'}
            titleStyle={!value ? {color: theme.colors.assertive}: {}}
            subtitle={!value ?  'Matching text not specified' : value}
            position={position?.includes('last') ?  ['last'] : []}
            onPress={() => navigation.navigate('Notes', {title: 'String Value', onDone: onChangedFilter})}
            // onPress={notesRef.current.present}
          />
        }
      />
      {/* Try passing a function to the notes screen so it can call it to pass us the text before it closes
      <TextModal
        ref={textModalRef}
        placeholder={'Type your notes here'}
        onDismiss={onDismiss}
      /> */}
    </>
  );
}

export { ListItemFilterString };
