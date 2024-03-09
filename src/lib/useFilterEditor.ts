import { AnyFilterValues, FilterType, FilterValues } from 'types/filter';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { eqObject, eqString } from 'realmdb/helpers';
import { useEffect, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { FilterState } from 'components/molecules/filters';
import { MultipleNavigatorParamList } from 'types/navigation';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useSetState } from '@react-native-ajp-elements/core';

export interface FilterEditorInterface<T> {
  filterId: string;
  filterType: FilterType;
  defaultFilter: T;
  filterValueLabels: Record<keyof T, string>;
  generalFilterName: string;
}

export const useFilterEditor = <T extends AnyFilterValues>(props: FilterEditorInterface<T>
) => {
  const {
    filterId,
    filterType,
    defaultFilter,
    filterValueLabels,
    generalFilterName,
  } = props;

  const realm = useRealm();
  const navigation: NavigationProp<MultipleNavigatorParamList> = useNavigation();
  const setScreenEditHeader = useScreenEditHeader();

  const filter = useObject(Filter, new BSON.ObjectId(filterId));

  const [name, setName] = useState(filter?.name);
  const [customName, setCustomName] = useState<string>();
  const [values, setValues] = useSetState(filter?.toJSON().values as FilterValues || defaultFilter);

  const [createSavedFilter, setCreateSavedFilter] = useState(false);
    
  useEffect(() => {
    if (!filter) return;

    const canSave =
    createSavedFilter && customName && customName.length > 0 ||
      !eqString(filter.name, name) ||
      !eqObject(filter.values, values);

    const onDone = () => {
      // Create a new filter.
      if (customName) {
        realm.write(() => {
          realm.create('Filter', {
            name: customName,
            type: filterType,
            values,
          });
        });

      } else {
        // Update the filter.
        realm.write(() => {
          filter.name = customName || name!;
          filter.type = filterType;
          filter.values = values;
        });
      }
      navigation.goBack();
    };

    setScreenEditHeader({
      enabled: canSave,
      visible: !createSavedFilter || (createSavedFilter && !!customName),
      label: (createSavedFilter && customName?.length) || name !== generalFilterName ? 'Save' : 'Update',
      action: onDone});
  }, [ name, customName, values, createSavedFilter ]);

  const onFilterValueChange = (property: keyof T, filterState: FilterState) => {
    // If there is a value label then add it to the filter state value as position [1].
    filterValueLabels[property] && filterState.value
      ? filterState.value[1] = filterValueLabels[property]
      : null;
    setValues({ [property]: filterState }, {assign: true});
  };

  const resetFilter = () => {
    setValues(defaultFilter, {assign: true});
  };

  return {
    filter,
    values,
    generalFilterName,
    name,
    customName,
    createSavedFilter,
    setName,
    setCustomName,  
    setCreateSavedFilter,
    resetFilter,
    onFilterValueChange,
  }
};
