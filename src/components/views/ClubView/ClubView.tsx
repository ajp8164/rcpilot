import React from 'react';
import { Linking, Text, View } from 'react-native';

import {
  Chip,
  Divider,
  ListItem,
  ThemeManager,
  // WebViewModal,
  useTheme,
} from '@react-native-hello/ui';
import { useRealm } from '@realm/react';
import { BSON } from 'realm';
import { Club } from 'realmdb';

// import formatcoords from 'formatcoords';

interface ClubViewInterface {
  clubId: string;
  hideName?: boolean;
}

export const ClubView = ({ clubId, hideName }: ClubViewInterface) => {
  const theme = useTheme();
  const s = useStyles();
  const realm = useRealm();
  // const webviewModalRef = useRef<WebViewModal>(null);

  // const [club, setClub] = useState<Club>();
  const club = realm.objectForPrimaryKey(
    'Club',
    new BSON.ObjectId(clubId),
  ) as Club;

  // const coords =
  //   location.coords.latitude &&
  //   location.coords.longitude &&
  //   formatcoords(location.coords.latitude, location.coords.longitude)
  //     .format({
  //       latLonSeparator: '|',
  //     })
  //     .split('|');

  // useEffect(() => {
  //   const club = clubs.find(c => {
  //     return c.id === clubId;
  //   }) as Club;
  //   setClub(club);

  //   navigation.setOptions({
  //     title: club?.name,
  //   });

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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
          // onPress={() => webviewModalRef.current?.present(club.websiteUrl)}
          onPress={() => Linking.openURL(club.websiteUrl)}
        />
      )}
      {/* <ListItem
          title={'Latitude'}
          position={['first']}
          value={coords ? coords[0] : ''}
        />
        <ListItem
          title={'Longitude'}
          position={['last']}
          value={coords ? coords[1] : ''}
        /> */}
      {/* <WebViewModal ref={webviewModalRef} /> */}
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
