import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  Chip,
  Divider,
  ListItem,
  ThemeManager,
  WebViewModal,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import formatcoords from 'formatcoords';
// import clubs from 'lib/content/clubs/GA.json';
import clubs from 'lib/content/clubs/MO.json';
import { Club } from 'types/club';
import { ClubsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<ClubsNavigatorParamList, 'Club'>;

const ClubScreen = ({ navigation, route }: Props) => {
  const { clubId } = route.params;

  const theme = useTheme();
  const s = useStyles();
  const webviewModalRef = useRef<WebViewModal>(null);

  const [club, setClub] = useState<Club>();

  const coords =
    club?.latitude &&
    club?.longitude &&
    formatcoords(club.latitude, club.longitude)
      .format({
        latLonSeparator: '|',
      })
      .split('|');

  useEffect(() => {
    const club = clubs.find(c => {
      return c.id === clubId;
    });
    setClub(club);

    navigation.setOptions({
      title: club?.name,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ScrollView style={theme.styles.view}>
        <Divider />
        <Text style={theme.text.h3}>{club?.name}</Text>
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
        <Text style={theme.text.normal}>{club?.address.street}</Text>
        <Text
          style={
            theme.text.normal
          }>{`${club?.address.city}, ${club?.address.state} ${club?.address.zip}`}</Text>
        <Divider />
        <Text style={theme.text.normal}>{club?.briefDescription}</Text>
        <Divider />
        <Text style={theme.text.normal}>{club?.keyFeatures}</Text>
        <Divider />
        {club?.websiteUrl && (
          <ListItem
            title={'Visit Website'}
            subtitle={club.websiteUrl}
            position={['first', 'last']}
            rightContent={'chevron-right'}
            onPress={() => webviewModalRef.current?.present(club.websiteUrl)}
          />
        )}
        <Divider />
        <ListItem
          title={'Latitude'}
          position={['first']}
          value={coords ? coords[0] : ''}
        />
        <ListItem
          title={'Longitude'}
          position={['last']}
          value={coords ? coords[1] : ''}
        />
      </ScrollView>
      <WebViewModal ref={webviewModalRef} />
    </>
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

export default ClubScreen;
