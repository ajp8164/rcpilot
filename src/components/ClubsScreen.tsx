import React, { useState } from 'react';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';

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
import { useQuery } from '@realm/react';
import SearchBar from 'components/atoms/SearchBar';
import { Club } from 'realmdb';
import { ClubsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<ClubsNavigatorParamList, 'Clubs'>;

const ClubsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  const clubs = useQuery<Club>('Club');

  const [query, setQuery] = useState('');

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: () => (
  //       <SearchBar
  //         value={query}
  //         onChangeText={setQuery}
  //         placeholder={'Find a Club'}
  //       />
  //     ),
  //   });
  // }, [navigation, query]);

  const renderClub: ListRenderItem<Club> = ({ item: club, index }) => {
    return (
      <ListItem
        title={club.name}
        // subtitle={club.amaChartered ? 'AMA Chartered' : undefined}
        // subtitle={`${club.amaChartered ? 'AMA Chartered' : ''} ${club.boating ? 'Boating' : ''} ${club.driving ? 'Driving' : ''} ${club.flying ? 'Flying' : ''}`}
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
        position={listItemPosition(index, clubs.length)}
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
    <View style={[theme.styles.view, { marginTop: device.insets.top }]}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={'Find a Club'}
        style={{}}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          data={clubs.sorted('name')}
          renderItem={renderClub}
          keyExtractor={(_item, index) => `${index}`}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<Divider style={s.divider} />}
        />
      </ScrollView>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  divider: {
    marginBottom: 15,
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
