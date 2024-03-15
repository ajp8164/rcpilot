import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItemCheckboxInfo, listItemPosition, swipeableDeleteItem } from 'components/atoms/List';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { saveSelectedPilot } from 'store/slices/pilot';
import { selectPilot } from 'store/selectors/pilotSelectors';
import { useConfirmAction } from 'lib/useConfirmAction';
import { usePilotSummary } from 'lib/pilot';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Pilots'>;

const PilotsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);
  const confirmAction = useConfirmAction();
  const dispatch = useDispatch();
  const realm = useRealm();

  const unknownPilots = useQuery(Pilot, pilots => pilots.filtered('unknownPilot == $0', true));
  const unknownPilot = unknownPilots[0];

  const allPilots = useQuery(Pilot, pilots => pilots.filtered('unknownPilot == $0', false));
  const selectedPilotId = useSelector(selectPilot).pilotId;
  const pilotSummary = usePilotSummary();

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<Icon name={'plus'} style={s.headerIcon}/>}
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

  const deletePilot = (pilot: Pilot) => {
    realm.write(() => {
      realm.delete(pilot);
    });
  };

  const renderPilot: ListRenderItem<Pilot> = ({ item: pilot, index }) => {
    return (
      <ListItemCheckboxInfo
        key={pilot._id.toString()}
        title={pilot.name}
        subtitle={pilotSummary(pilot)}
        position={listItemPosition(index, allPilots.length)}
        checked={pilot._id.toString() === selectedPilotId}
        onPress={() => setPilot(pilot)}
        onPressInfo={() => navigation.navigate('Pilot', {
          pilotId: pilot._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            ...swipeableDeleteItem[theme.mode],
            onPress: () => confirmAction(deletePilot, {
              label: 'Delete Pilot',
              title: 'This action cannot be undone.\nAre you sure you want to delete this pilot?',
              value: pilot,
            })
          }]
        }}
      />
    )
  };

  const renderFooter = () => {
    return (
      <>
        {allPilots && <Divider />}
        <ListItemCheckboxInfo
          title={unknownPilot.name}
          subtitle={pilotSummary(unknownPilot)}
          position={['first', 'last']}
          hideInfo={true}
          checked={unknownPilot._id.toString() === selectedPilotId}
          onPress={() => setPilot(unknownPilot)}
        />
        <Divider note text={'Includes events logged with an "Unknown" pilot and model time not directly associated with an event.'} />
      </>
    );
  };

  return (
    <FlatList
      style={theme.styles.view}
      data={allPilots}
      renderItem={renderPilot}
      keyExtractor={item => item._id.toString()}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={allPilots.length ? <Divider /> : null}
      ListFooterComponent={renderFooter}
    />
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
  },
}));

export default PilotsScreen;
