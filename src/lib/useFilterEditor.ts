import { useSetState } from '@react-native-hello/core';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useObject, useRealm } from '@realm/react';
import { FilterState } from 'components/molecules/filters';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useEffect, useState } from 'react';
import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { eqObject } from 'realmdb/helpers';
import { AnyFilterValues, FilterType, FilterValues } from 'types/filter';
import { MultipleNavigatorParamList } from 'types/navigation';

export interface FilterEditorInterface<T> {
  filterId: string;
  filterType: FilterType;
  defaultFilter: T;
  filterValueLabels: Record<keyof T, string>;
  generalFilterName: string;
}

export type FilterEditorInstance<T> = {
  filter: Filter | null;
  values: FilterValues;
  generalFilterName: string;
  name?: string;
  customName?: string;
  createSavedFilter: boolean;
  setName: React.Dispatch<React.SetStateAction<string | undefined>>;
  setCustomName: React.Dispatch<React.SetStateAction<string | undefined>>;
  setCreateSavedFilter: React.Dispatch<React.SetStateAction<boolean>>;
  resetFilter: () => void;
  onFilterValueChange: (property: keyof T, filterState: FilterState) => void;
};

export const useFilterEditor = <T extends AnyFilterValues>(
  props: FilterEditorInterface<T>,
): FilterEditorInstance<T> => {
  const {
    filterId,
    filterType,
    defaultFilter,
    filterValueLabels,
    generalFilterName,
  } = props;

  const realm = useRealm();
  const navigation: NavigationProp<MultipleNavigatorParamList> =
    useNavigation();
  const setScreenEditHeader = useScreenEditHeader();

  const filter = useObject(Filter, new BSON.ObjectId(filterId));

  const [name, setName] = useState(filter?.name);
  const [customName, setCustomName] = useState<string>();
  const [values, setValues] = useSetState(
    (filter?.toJSON().values as FilterValues) || defaultFilter,
  );

  const [createSavedFilter, setCreateSavedFilter] = useState(false);

  useEffect(() => {
    if (!filter) return;

    const canSubmit =
      (createSavedFilter && customName && customName.length > 0) ||
      filter.name !== name ||
      !eqObject(filter.values, values);

    const save = () => {
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
          filter.name = customName || name || 'no-name';
          filter.type = filterType;
          filter.values = values;
        });
      }
      navigation.goBack();
    };

    setScreenEditHeader({
      enabled: canSubmit,
      label: 'Save',
      action: save,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, customName, values, createSavedFilter]);

  const onFilterValueChange = (property: keyof T, filterState: FilterState) => {
    // If there is a value label then add it to the filter state value as position [1].
    filterValueLabels[property] && filterState.value
      ? (filterState.value[1] = filterValueLabels[property])
      : null;
    setValues({ [property]: filterState }, { assign: true });
  };

  const resetFilter = () => {
    setValues(defaultFilter, { assign: true });
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
  };
};
