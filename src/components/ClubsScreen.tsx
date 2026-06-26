import React, { useState } from 'react';
import { FlatList, ListRenderItem, Pressable, Text, View } from 'react-native';

import {
  Chip,
  Divider,
  ListItem,
  ThemeManager,
  listItemPosition,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery } from '@realm/react';
import SearchBar from 'components/atoms/SearchBar';
import { EmptyView } from 'components/molecules/EmptyView';
import { getDeviceCountry } from 'lib/clubs/deviceCountry';
import { SearchResult, useClubSearch } from 'lib/clubs/useClubSearch';
import { LocateFixed } from 'lucide-react-native';
import { Club } from 'realmdb';
import { ClubsNavigatorParamList } from 'types/navigation';

// Convert a 2-letter country code to its flag emoji.
const countryFlag = (code: string): string => {
  const base = 0x1f1e6 - 65;
  return String.fromCodePoint(
    base + code.charCodeAt(0),
    base + code.charCodeAt(1),
  );
};

export type Props = NativeStackScreenProps<ClubsNavigatorParamList, 'Clubs'>;

const ClubsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();
  const tabBarHeight = useBottomTabBarHeight();

  const clubs = useQuery<Club>('Club');
  const [query, setQuery] = useState('');
  // TODO: wire up country picker to call setSelectedCountry
  const [selectedCountry, setSelectedCountry] = useState(() => getDeviceCountry());
  const results = useClubSearch(clubs, query, selectedCountry);

  const renderItem: ListRenderItem<SearchResult> = ({ item, index }) => {
    if (item.type === 'location') {
      return (
        <ListItem
          title={item.label}
          position={listItemPosition(index, results.length)}
          leftContent={
            <LocateFixed color={theme.colors.listItemIcon} />
          }
          rightContent={'chevron-right'}
          onPress={() => {
            // TODO: handle location tap
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
        onPress={() =>
          navigation.navigate('Club', {
            clubId: club._id.toString(),
          })
        }
      />
    );
  };

  return (
    <View
      style={[
        theme.styles.view,
        {
          paddingTop: device.insets.top,
          marginBottom: tabBarHeight,
        },
      ]}>
      <View style={s.searchRow}>
        <Pressable
          style={s.countryChip}
          onPress={() => {
            // TODO: country picker
          }}>
          <Text style={s.countryFlag}>{countryFlag(selectedCountry)}</Text>
        </Pressable>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={'Find a Club'}
          style={{ flex: 1 }}
        />
      </View>
      {results.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={results}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type === 'location' ? `loc-${item.label}` : `club-${index}`
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<Divider />}
        />
      ) : null}
      {results.length === 0 ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <EmptyView
            info
            message={query.trim().length >= 2 ? 'No Results' : 'Search Clubs'}
            details={
              query.trim().length >= 2
                ? 'Try a different search.'
                : 'Enter a club name, city, or state.'
            }
          />
        </View>
      ) : null}
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
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

export default ClubsScreen;
