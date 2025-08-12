import { Divider, ListItemSwitchCollapsible } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { ListItemInput } from 'components/atoms/List';
import { FilterEditorInstance } from 'lib/useFilterEditor';
import lodash from 'lodash';
import { useEffect } from 'react';
import React, { View } from 'react-native';
import { useTheme } from 'theme';

interface FilterEditorHeader<T> {
  defaultFilter: T;
  filterEditor: FilterEditorInstance<T>;
  itemName: string;
  requireFilterName?: boolean;
}

function FilterEditorHeader<T>({
  defaultFilter,
  filterEditor,
  itemName,
  requireFilterName,
}: FilterEditorHeader<T>) {
  const theme = useTheme();

  const name = lodash.startCase(`${itemName.replace('y', 'ie')}s`); // Handle 'y' in 'battery'

  useEffect(() => {
    if (requireFilterName) {
      filterEditor.setCreateSavedFilter(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderListInputCustomName = (props: {
    position: ('first' | 'last' | undefined)[];
  }) => (
    <ListItemInput
      position={props.position}
      inputProps={{
        onChangeText: value => filterEditor.setCustomName(value),
        value: filterEditor.customName || '',
        placeholder: 'Filter Name',
        autoCapitalize: 'words',
      }}
    />
  );

  return (
    <View>
      <Divider
        text={'FILTER NAME'}
        rightComponent={
          <Button
            title={'Reset Filter'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.dividerButton}
            disabledStyle={theme.styles.dividerButtonDisabled}
            disabled={lodash.isEqual(filterEditor.values, defaultFilter)}
            onPress={filterEditor.resetFilter}
          />
        }
      />
      {filterEditor.name === filterEditor.generalFilterName ? (
        requireFilterName ? (
          renderListInputCustomName({ position: ['first', 'last'] })
        ) : (
          <ListItemSwitchCollapsible
            title={'Create a Saved Filter'}
            position={
              filterEditor.createSavedFilter ? ['first'] : ['first', 'last']
            }
            value={filterEditor.createSavedFilter}
            expanded={filterEditor.createSavedFilter}
            onValueChange={filterEditor.setCreateSavedFilter}>
            {renderListInputCustomName({ position: ['last'] })}
          </ListItemSwitchCollapsible>
        )
      ) : (
        <ListItemInput
          position={['first', 'last']}
          inputProps={{
            onChangeText: value => filterEditor.setName(value),
            value: filterEditor.name || '',
            placeholder: 'Filter Name',
            autoCapitalize: 'words',
          }}
        />
      )}
      <Divider
        note
        light
        subHeaderStyle={theme.styles.textSmall}
        text={`This filter shows all the ${name} that match all of these criteria.`}
      />
    </View>
  );
}

export { FilterEditorHeader };
