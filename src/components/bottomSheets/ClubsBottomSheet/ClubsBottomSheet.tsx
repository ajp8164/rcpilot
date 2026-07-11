import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ListRenderItem, Pressable, Text, View } from 'react-native';

import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import {
  Chip,
  Divider,
  ListItem,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { useQuery } from '@realm/react';
import IconCloseX from 'components/atoms/IconCloseX';
import { ModalHeader } from 'components/atoms/ModalHeader';
import SearchBar from 'components/atoms/SearchBar';
import { EmptyView } from 'components/molecules/EmptyView';
import { MenuView } from '@react-native-menu/menu';
import { getDeviceCountry } from 'lib/clubs/deviceCountry';
import { COUNTRY_NAMES, countryFlag } from 'lib/clubs/countryNames';
import { SearchResult, useClubSearch } from 'lib/clubs/useClubSearch';
import { LocateFixed } from 'lucide-react-native';
import { Club } from 'realmdb';

import { ClubsBottomSheetMethods, ClubsBottomSheetProps } from './types';

const SNAP_POINTS = ['40%', '80%'];

type ClubsBottomSheet = ClubsBottomSheetMethods;

const ClubsBottomSheet = React.forwardRef<
  ClubsBottomSheet,
  ClubsBottomSheetProps
>((props, ref) => {
  const { onDismiss, onPressClub } = props;

  const theme = useTheme();
  const s = useStyles();

  const innerRef = useRef<BottomSheet>(null);
  const currentIndexRef = useRef(0);
  const dismissing = useRef(false);

  // Search state
  const [query, setQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(() => getDeviceCountry());

  // Clubs query and search
  const clubs = useQuery<Club>('Club');
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

  const clubResults = useClubSearch(clubs, query, selectedCountry);
  const queryValid = query.trim().length >= 2;

  useImperativeHandle(ref, () => ({
    dismiss,
    getCurrentIndex: () => currentIndexRef.current,
    present,
    snapToIndex,
  }));

  const dismiss = (restoreMap = true) => {
    if (dismissing.current) return;
    dismissing.current = true;
    innerRef.current?.close();
    if (restoreMap) onDismiss?.();
  };

  const present = () => {
    dismissing.current = false;
    innerRef.current?.snapToIndex(1);
  };

  const snapToIndex = (index: number) => {
    dismissing.current = false;
    innerRef.current?.snapToIndex(index);
  };

  const renderItem: ListRenderItem<SearchResult> = useCallback(({ item, index }) => {
    if (item.type === 'location') {
      return (
        <ListItem
          title={item.label}
          position={listItemPosition(index, clubResults.length)}
          leftContent={<LocateFixed color={theme.colors.listItemIcon} />}
          value={`${item.count}`}
          onPress={() => setQuery(item.label)}
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
              <Chip text="AMA" color={s.ama.backgroundColor} textColor={s.chipText.color} style={s.chip} />
            ) : null}
            {club?.boating ? (
              <Chip text="Boating" color={s.boating.backgroundColor} textColor={s.chipText.color} style={s.chip} />
            ) : null}
            {club?.driving ? (
              <Chip text="Driving" color={s.driving.backgroundColor} textColor={s.chipText.color} style={s.chip} />
            ) : null}
            {club?.flying ? (
              <Chip text="Flying" color={s.flying.backgroundColor} textColor={s.chipText.color} style={s.chip} />
            ) : null}
          </View>
        }
        position={listItemPosition(index, clubResults.length)}
        rightContent={'chevron-right'}
        onPress={() => onPressClub?.(club._id.toString())}
      />
    );
  }, [clubResults.length, onPressClub, theme.colors.listItemIcon, s]);

  return (
    <BottomSheet
      ref={innerRef}
      index={-1}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      onChange={(index) => {
        if (index >= 0) currentIndexRef.current = index;
      }}
      backgroundStyle={{ backgroundColor: theme.colors.viewBackground }}
      handleIndicatorStyle={s.handleIndicator}>
      <ModalHeader
        size={'small'}
        title={'Club Finder'}
        titleStyle={s.titleLeft}
        rightButtonIcon={<IconCloseX />}
        onRightButtonPress={() => dismiss()}
      />
      {/* Sticky search bar */}
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
            <Text style={s.countryFlag}>{countryFlag(selectedCountry)}</Text>
          </Pressable>
        </MenuView>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={'Club name or location'}
          style={{ flex: 1 }}
        />
      </View>
      <BottomSheetFlatList
        data={clubResults}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'location' ? `loc-${item.label}` : `club-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.contentContainer}
        ListFooterComponent={<Divider />}
        ListEmptyComponent={
          <>
            <Divider />
            <EmptyView
              info={queryValid}
              message={queryValid ? 'No Clubs Found' : 'Find Clubs'}
              details={
                queryValid
                  ? 'Try a different search.'
                  : 'Enter a club name, city, or state.'
              }
              positionTop
            />
          </>
        }
      />
    </BottomSheet>
  );
});

export { ClubsBottomSheet };

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
  contentContainer: {
    paddingHorizontal: theme.spacing.M,
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
  handleIndicator: {
    backgroundColor: theme.colors.lightGray,
  },
  titleLeft: {
    alignSelf: 'flex-start',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.M,
    marginBottom: 10,
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
