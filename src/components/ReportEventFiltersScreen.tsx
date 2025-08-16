import {
  Divider,
  ListEditor,
  ListEditorMethods,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useRealm } from '@realm/react';
import { Button } from 'components/atoms/Button';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { FiltersListHeader } from 'components/molecules/FiltersListHeader';
import { filterSummary } from 'lib/filter';
import { defaultFilter } from 'lib/reports/reportEvents';
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
import { ReportEventFiltersNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ReportEventFiltersNavigatorParamList,
  'ReportEventFilters'
>;

const ReportEventFiltersScreen = ({ navigation, route }: Props) => {
  const { filterType, modelType, useGeneralFilter } = route.params;

  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const generalReportEventsFilterName = `general-${lodash.kebabCase(filterType)}`;
  const allEventFilters = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name != $1',
      filterType,
      generalReportEventsFilterName,
    );
  });

  const generalReportEventsFilterQuery = useQuery(Filter, filters => {
    return filters.filtered(
      'type == $0 AND name == $1',
      filterType,
      generalReportEventsFilterName,
    );
  });
  const [generalReportEventsFilter, setGeneralEventsFilter] =
    useState<Filter>();

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
              generalReportEventsFilter &&
              navigation.navigate('ReportEventFilterEditor', {
                filterId: generalReportEventsFilter._id.toString(),
                filterType,
                generalFilterName: generalReportEventsFilterName,
                modelType,
                requireFilterName: true,
              })
            }
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalReportEventsFilter, generalReportEventsFilterName]);

  useEffect(() => {
    // Lazy initialization of a general events filter.
    if (!generalReportEventsFilterQuery.length) {
      realm.write(() => {
        const gef = realm.create('Filter', {
          name: generalReportEventsFilterName,
          type: filterType,
          values: defaultFilter,
        });

        // @ts-ignore
        setGeneralEventsFilter(gef);
      });
    } else {
      setGeneralEventsFilter(generalReportEventsFilterQuery[0]);
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
        position={listItemPosition(index, allEventFilters.length)}
        checked={filter._id.toString() === selectedFilterId}
        onPress={() => setFilter(filter)}
        onPressInfo={() =>
          navigation.navigate('ReportEventFilterEditor', {
            filterId: filter._id.toString(),
            filterType,
            generalFilterName: generalReportEventsFilterName,
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
        filterSummary={filterSummary(generalReportEventsFilter)}
        itemName={'event'}
        generalFilterId={generalReportEventsFilter?._id.toString()}
        selectedFilterId={selectedFilterId}
        useGeneralFilter={useGeneralFilter}
        onPressEditGeneralFilter={() =>
          navigation.navigate('ReportEventFilterEditor', {
            filterId: generalReportEventsFilter?._id.toString() || '',
            filterType,
            generalFilterName: generalReportEventsFilterName,
            modelType,
          })
        }
        onPressGeneralFilter={() => setFilter(generalReportEventsFilter)}
        onPressNoFilter={setFilter}
      />
      <ListEditor ref={listEditorRef}>
        <FlatList
          data={allEventFilters}
          renderItem={renderFilters}
          keyExtractor={item => `${item._id.toString()}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            allEventFilters.length ? (
              <Divider text={'SAVED EVENT FILTERS'} />
            ) : null
          }
        />
      </ListEditor>
    </View>
  );
};

export default ReportEventFiltersScreen;
