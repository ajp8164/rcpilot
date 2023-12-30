import { AppTheme, useTheme } from 'theme';
import { ListItem, ListItemInput } from 'components/atoms/List';

import { Divider } from '@react-native-ajp-elements/ui';
import { LocationNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<LocationNavigatorParamList, 'LocationDetails'>;

const LocationDetailsScreen = ({ navigation, route }: Props) => {
  const { locationId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <SafeAreaView edges={['left', 'right']} style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'INFORMATION'}/>
        <ListItemInput
          placeholder={'Location Name'}
          value={'Nickajack Elementary School'}
          position={['first', 'last']}
          onChangeText={() => null}
        /> 
        <Divider />
        <ListItem
          title={'Notes'}
          position={['first', 'last']}
          onPress={() => navigation.navigate('Notes', {
            title: 'Fuel Notes',
            text: 'notes', // mock
            eventName: 'fuel-notes',  
          })}
        />
        <Divider text={'COORDINATES'}/>
        <ListItem
          title={'Latitude'}
          position={['first']}
          value={'33 50 31.61 N'}
          rightImage={false}
          onPress={() => null}
        />
        <ListItem
          title={'Longitude'}
          position={['last']}
          value={'84 30 58.67 W'}
          rightImage={false}
          onPress={() => null}
        />
        <Divider text={'EVENTS'}/>
        <ListItem
          title={'Last On'}
          position={['first']}
          value={'Nov 4, 2023 at 11:49PM'}
          rightImage={false}
          onPress={() => null}
        />
        <ListItem
          title={'Details'}
          position={['last']}
        />
        <Divider />
        <ListItem
          title={'Delete Location'}
          titleStyle={s.delete}
          position={['first', 'last']}
          rightImage={false}
          onPress={() => null}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  delete: {
    alignSelf: 'center',
    textAlign: 'center',
    color: theme.colors.screenHeaderBackButton,
  },
}));

export default LocationDetailsScreen;
