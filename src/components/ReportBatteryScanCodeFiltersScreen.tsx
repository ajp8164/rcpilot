import {
  Divider,
  ListEditor,
  ListEditorMethods,
  listItemPosition,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { FiltersListHeader } from 'components/molecules/FiltersListHeader';
import { filterSummary } from 'lib/filter';
import { defaultFilter } from 'lib/reports/reportBatteryScanCode';
import { useConfirmAction } from 'lib/useConfirmAction';
import lodash from 'lodash';
import { Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BSON } from 'realm';
import { Filter } from 'realmdb/Filter';
import { selectFilters } from 'store/selectors/filterSelectors';
import { saveSelectedFilter } from 'store/slices/filters';
import { useTheme } from 'theme';
import { ReportBatteryScanCodeFiltersNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ReportBatteryScanCodeFiltersNavigatorParamList,
  'ReportBatteryScanCodeFilters'
>;

const ReportBatteryScanCodeFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalReportBatteryScanCodesFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allBatteryScanCodeFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      filterType,
      generalReportBatteryScanCodesFilterName,
    );
  });

  const generalReportBatteryScanCodesFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      filterType,
      generalReportBatteryScanCodesFilterName,
    );
  });
  const [
    generalReportBatteryScanCodesFilter,
    setGeneralBatteryScanCodesFilter,
  ] = useState<Filter>();

  const selectedFilterId = useSelector(selectFilters(filterType));

  const listEditorRef = useRef<ListEditorMethods>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<Plus color={theme.colors.screenHeaderButtonText} />}
            onPress={() =>
              generalReportBatteryScanCodesFilter &&
              navigation.navigate('ReportBatteryScanCodeFilterEditor', {
                filterId: generalReportBatteryScanCodesFilter._id.toString(),
                filterType,
                generalFilterName: generalReportBatteryScanCodesFilterName,
                modelType,
                requireFilterName: true,
              })
            }
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    generalReportBatteryScanCodesFilter,
    generalReportBatteryScanCodesFilterName,
  ]);

  useEffect(() => {
    // Lazy initialization of a general report battery scan codes filter.
    if (!generalReportBatteryScanCodesFilterQuery.length) {
      realm.write(() => {
        const gef = realm.create('Filter', {
          name: generalReportBatteryScanCodesFilterName,
          type: filterType,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralBatteryScanCodesFilter(gef);
      });
    } else {
      setGeneralBatteryScanCodesFilter(
        generalReportBatteryScanCodesFilterQuery[0],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilter = (filter?: Filter) => {
    dispatch(
      saveSelectedFilter({
        filterId: filter?._id?.toString(),
        filterType,
      }),
    );
  };

  const deleteFilter = (filterId: string) => {
    if (selectedFilterId === filterId) {
      setFilter();
    }

    // Wait for filter setting to change before deletion.
    setTimeout(() => {
      const filter = realm.objectForPrimaryKey(
        'Filter',
        new BSON.ObjectId(filterId),
      );
      if (filter?.isValid()) {
        realm.write(() => {
          realm.delete(filter);
        });
      }
    });
  };

  const renderFilters: ListRenderItem<Filter> = ({ item: filter, index }) => {
    return (
      <ListItemCheckBoxInfo
        key={filter._id.toString()}
        title={filter.name}
        subtitle={filterSummary(filter)}
        subtitleLines={0}
        position={listItemPosition(index, allBatteryScanCodeFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        listEditor={listEditorRef.current}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('ReportBatteryScanCodeFilterEditor', {
            filterId: filter._id.toString(),
            filterType,
            generalFilterName: generalReportBatteryScanCodesFilterName,
            modelType,
          })
        }
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: 'Delete Saved Filter',
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this saved filter?',
              });
            },
            onPress: () => deleteFilter(filter._id.toString()),
          },
        ]}
      />
    );
  };

  return (
    <View style={theme.styles.view}>
      <FiltersListHeader
        filterSummary={filterSummary(generalReportBatteryScanCodesFilter)}
        itemName={'battery'}
        generalFilterId={generalReportBatteryScanCodesFilter?._id.toString()}
        selectedFilterId={selectedFilterId}
        useGeneralFilter={useGeneralFilter}
        onPressEditGeneralFilter={() =>
          navigation.navigate('ReportBatteryScanCodeFilterEditor', {
            filterId: generalReportBatteryScanCodesFilter?._id.toString() || '',
            filterType,
            generalFilterName: generalReportBatteryScanCodesFilterName,
            modelType,
          })
        }
        onPressGeneralFilter={() =>
          setFilter(generalReportBatteryScanCodesFilter)
        }
        onPressNoFilter={setFilter}
      />
      <ListEditor ref={listEditorRef}>
        <FlatList
          data={allBatteryScanCodeFilters}
          renderItem={renderFilters}
          keyExtractor={(_item, index) => `${index}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            allBatteryScanCodeFilters.length ? (
              <Divider text={'SAVED BATTERY FILTERS'} />
            ) : null
          }
        />
      </ListEditor>
    </View>
  );
};

export default ReportBatteryScanCodeFiltersScreen;
