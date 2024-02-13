import { ActionSheetConfirm, ActionSheetConfirmMethods } from 'components/molecules/ActionSheetConfirm';
import { AppTheme, useTheme } from 'theme';
import { FlatList, ListRenderItem } from 'react-native';
import { ListItemCheckboxInfo, listItemPosition } from 'components/atoms/List';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useRealm } from '@realm/react';

import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pilot } from 'realmdb/Pilot';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';
import { saveSelectedPilot } from 'store/slices/pilot';
import { selectPilot } from 'store/selectors/pilotSelectors';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Pilots'>;

const PilotsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();

  const allPilots = useQuery(Pilot);
  const selectedPilotId = useSelector(selectPilot).pilotId;
  const dispatch = useDispatch();

  const actionSheetConfirm = useRef<ActionSheetConfirmMethods>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <Button
            buttonStyle={[theme.styles.buttonScreenHeader, s.headerButton]}
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
        position={listItemPosition(index, allPilots.length)}
        checked={pilot._id.toString() === selectedPilotId}
        onPress={() => setPilot(pilot)}
        onPressInfo={() => navigation.navigate('Pilot', {
          pilotId: pilot._id.toString(),
        })}
        swipeable={{
          rightItems: [{
            icon: 'trash',
            iconType: 'font-awesome',
            text: 'Delete',
            color: theme.colors.assertive,
            x: 64,
            onPress: () => actionSheetConfirm.current?.confirm(pilot),
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
          title={'Unknown Pilot'}
          subtitle={'Logged 0:04 over 1 event'}
          position={['first', 'last']}
          hideInfo={true}
          checked={!selectedPilotId}
          onPress={setPilot}
        />
        <Divider type={'note'} text={'Includes events logged with an "Unknown" pilot and model time not directly associated with an event.'} />
      </>
    );
  };

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <FlatList
        data={allPilots}
        renderItem={renderPilot}
        keyExtractor={item => item._id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={Divider}
        ListFooterComponent={renderFooter}
      />
      <ActionSheetConfirm ref={actionSheetConfirm} label={'Delete Pilot'} onConfirm={deletePilot} />
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  headerButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  headerIcon: {
    color: theme.colors.screenHeaderButtonText,
    fontSize: 22,
  },
}));

export default PilotsScreen;
