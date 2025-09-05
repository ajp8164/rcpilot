import React from 'react';
import { FlatList, ListRenderItem, ScrollView, View } from 'react-native';

import {
  Chip,
  Divider,
  ListItem,
  ThemeManager,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import clubs from 'lib/content/clubs/GA.json';
import clubs from 'lib/content/clubs/MO.json';
import { Club } from 'types/club';
import { ClubsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<ClubsNavigatorParamList, 'Clubs'>;

const ClubsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();

  console.log(clubs);
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
            clubId: club.id,
          })
        }
      />
    );
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <FlatList
        data={(clubs as Club[]).sort((a, b) => {
          return a.name < b.name ? -1 : 1;
        })}
        renderItem={renderClub}
        keyExtractor={(_item, index) => `${index}`}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<Divider style={s.divider} />}
      />
    </ScrollView>
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
