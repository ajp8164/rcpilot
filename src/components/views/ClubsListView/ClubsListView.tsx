import React, { useMemo, useState } from 'react';
import { FlatList, ListRenderItem, Pressable, Text, View } from 'react-native';

import {
  Chip,
  Divider,
  ListItem,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useQuery } from '@realm/react';
import SearchBar from 'components/atoms/SearchBar';
import { EmptyView } from 'components/molecules/EmptyView';
import { MenuView } from '@react-native-menu/menu';
import { getDeviceCountry } from 'lib/clubs/deviceCountry';
import { COUNTRY_NAMES, countryFlag } from 'lib/clubs/countryNames';
import { SearchResult, useClubSearch } from 'lib/clubs/useClubSearch';
import { LocateFixed } from 'lucide-react-native';
import { Club } from 'realmdb';

import { ClubsListViewMethods, ClubsListViewProps } from './types';

type ClubsListView = ClubsListViewMethods;

const ClubsListView = React.forwardRef<ClubsListView, ClubsListViewProps>(
  (props, _ref) => {
    const { ListHeaderComponent, useBottomSheetList = false, onPressClub } = props;

    const theme = useTheme();
    const s = useStyles();

    const clubs = useQuery<Club>('Club');
    const [query, setQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(() =>
      getDeviceCountry(),
    );

    // Derive available countries from the club data.
    const availableCountries = useMemo(() => {
      const codes = new Set<string>();
      for (const club of clubs) {
        const country = club.address?.country;
        if (country) codes.add(country);
      }
      return [...codes]
        .map(code => ({ code, name: COUNTRY_NAMES[code] || code }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }, [clubs]);

    const results = useClubSearch(clubs, query, selectedCountry);

    const renderItem: ListRenderItem<SearchResult> = ({ item, index }) => {
      if (item.type === 'location') {
        return (
          <ListItem
            title={item.label}
            position={listItemPosition(index, results.length)}
            leftContent={<LocateFixed color={theme.colors.listItemIcon} />}
            value={`${item.count}`}
            onPress={() => {
              setQuery(item.label);
            }}
          />
        );
      }

      const { club } = item;
      return (
        <ListItem
          title={club.name}
          subtitle={
            <View style={s.chips}>
              {club?.amaChartered ? (
                <Chip
                  text="AMA"
                  color={s.ama.backgroundColor}
                  textColor={s.chipText.color}
                  style={s.chip}
                />
              ) : null}
              {club?.boating ? (
                <Chip
                  text="Boating"
                  color={s.boating.backgroundColor}
                  textColor={s.chipText.color}
                  style={s.chip}
                />
              ) : null}
              {club?.driving ? (
                <Chip
                  text="Driving"
                  color={s.driving.backgroundColor}
                  textColor={s.chipText.color}
                  style={s.chip}
                />
              ) : null}
              {club?.flying ? (
                <Chip
                  text="Flying"
                  color={s.flying.backgroundColor}
                  textColor={s.chipText.color}
                  style={s.chip}
                />
              ) : null}
            </View>
          }
          position={listItemPosition(index, results.length)}
          rightContent={'chevron-right'}
          onPress={() => onPressClub?.(club._id.toString())}
        />
      );
    };

    const SearchHeader = (
      <>
        {ListHeaderComponent}
        <View style={s.searchRow}>
          <MenuView
            actions={availableCountries.map(country => ({
              id: country.code,
              title: `${countryFlag(country.code)} ${country.name}`,
              state: selectedCountry === country.code ? 'on' : 'off',
            }))}
            onPressAction={({ nativeEvent }) => {
              setSelectedCountry(nativeEvent.event);
            }}>
            <Pressable style={s.countryChip}>
              <Text style={s.countryFlag}>
                {countryFlag(selectedCountry)}
              </Text>
            </Pressable>
          </MenuView>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={'Find a Club'}
            style={{ flex: 1 }}
          />
        </View>
      </>
    );

    const ListComponent = useBottomSheetList ? BottomSheetFlatList : FlatList;

    return (
      <>
        <ListComponent
          data={results}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type === 'location' ? `loc-${item.label}` : `club-${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.contentContainer}
          ListHeaderComponent={SearchHeader}
          ListFooterComponent={<Divider />}
          ListEmptyComponent={
            <EmptyView
              info
              message={
                query.trim().length >= 2 ? 'No Results' : 'Search Clubs'
              }
              details={
                query.trim().length >= 2
                  ? 'Try a different search.'
                  : 'Enter a club name, city, or state.'
              }
              positionTop
            />
          }
        />
      </>
    );
  },
);

export default ClubsListView;

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  contentContainer: {
    paddingHorizontal: 15,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  countryChip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 6,
  },
  countryFlag: {
    fontSize: 18,
  },
  chip: {
    marginRight: 5,
  },
  chips: {
    flexDirection: 'row',
  },
  chipText: {
    color: theme.colors.stickyWhite,
  },
  ama: {
    backgroundColor: 'gray',
  },
  boating: {
    backgroundColor: 'blue',
  },
  driving: {
    backgroundColor: 'brown',
  },
  flying: {
    backgroundColor: 'red',
  },
}));
