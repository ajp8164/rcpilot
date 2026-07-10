import React from 'react';
import { Linking, Text, View } from 'react-native';

import {
  Chip,
  Divider,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { useRealm } from '@realm/react';
import { BSON } from 'realm';
import { Club } from 'realmdb';

interface ClubViewInterface {
  clubId: string;
  hideName?: boolean;
}

export const ClubView = ({ clubId, hideName }: ClubViewInterface) => {
  const theme = useTheme();
  const s = useStyles();
  const realm = useRealm();

  const club = realm.objectForPrimaryKey(
    'Club',
    new BSON.ObjectId(clubId),
  ) as Club;

  return (
    <>
      {!hideName ? <Text style={theme.text.h3}>{club?.name}</Text> : null}
      <View style={s.chips}>
        {club?.amaChartered ? (
          <Chip
            text="AMA Chartered"
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
      <Text style={theme.text.normal}>{club?.address.addressLine1}</Text>
      <Text
        style={
          theme.text.normal
        }>{`${club?.address.city}, ${club?.address.state} ${club?.address.postalCode}`}</Text>
      <Divider />
      <Text style={theme.text.normal}>{club?.description}</Text>
      <Divider />
      <Text style={theme.text.normal}>{club?.keyFeatures}</Text>
      <Divider />
      {club?.websiteUrl && (
        <ListItem
          title={'Visit Website'}
          subtitle={club.websiteUrl}
          position={['first', 'last']}
          rightContent={'chevron-right'}
          onPress={() => Linking.openURL(club.websiteUrl)}
        />
      )}
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  chip: {
    marginRight: 5,
  },
  chips: {
    flexDirection: 'row',
    marginVertical: 5,
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

export default ClubView;
