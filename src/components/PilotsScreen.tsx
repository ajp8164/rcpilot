import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem } from 'react-native';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItemCheckboxInfo } from 'components/atoms/List';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { saveSelectedPilot } from 'store/slices/pilot';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { useQuery } from '@realm/react';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Pilots'>;

const PilotsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const allPilots = useQuery(Pilot);
  const selectedPilotId = useSelector(selectPilot).pilotId;
  const dispatch = useDispatch();

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            type={'clear'}
            icon={ <Icon name={'plus'} style={s.addIcon} /> }
            onPress={() => navigation.navigate('NewPilot')}
          />
        )
      },
    });
  }, []);

  const setPilot = (pilot?: Pilot) => {
    dispatch(
      saveSelectedPilot({
        pilotId: pilot?._id?.toString(),
      }),
    );
  };

  const renderItems: ListRenderItem<Pilot> = ({ item, index }) => {
    return (
      <ListItemCheckboxInfo
        key={item._id.toString()}
        title={item.name}
        position={allPilots.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === allPilots.length - 1 ? ['last'] : []}
        checked={item._id.toString() === selectedPilotId}
        onPress={() => setPilot(item)}
        onPressInfo={() => navigation.navigate('Pilot', {
          pilotId: item._id.toString(),
        })}
      />
    )
  };

  const renderFooter = () => {
    return (
      <>
        {allPilots && <Divider />}
        <ListItemCheckboxInfo
          title={'Unknown Pilot'}
          subtitle={'Logged 0:04 over 1 event'}
          position={['first', 'last']}
          hideInfo={true}
          checked={!selectedPilotId}
          onPress={setPilot}
        />
        <Divider type={'note'} text={'Includes events logged with an "Unknown" pilot and model time not directly associated with an event.'}  />
      </>
    );
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <FlatList
        data={allPilots}
        renderItem={renderItems}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={Divider}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  addIcon: {
    color: theme.colors.brandPrimary,
    fontSize: 22,
  },
}));

export default PilotsScreen;
