import React, { useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';

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
import { SearchResult, useClubSearch } from 'lib/clubs/useClubSearch';
import { LocateFixed } from 'lucide-react-native';
import { Club } from 'realmdb';
import { ClubsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<ClubsNavigatorParamList, 'Clubs'>;

const ClubsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();
  const tabBarHeight = useBottomTabBarHeight();

  const clubs = useQuery<Club>('Club');
  const [query, setQuery] = useState('');
  const results = useClubSearch(clubs, query);

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
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={'Find a Club'}
        style={{ zIndex: 1 }}
      />
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
