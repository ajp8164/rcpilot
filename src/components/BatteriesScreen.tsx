import { AppTheme, useTheme } from 'theme';
import { Divider, ListItem } from '@react-native-ajp-elements/ui';
import React, { useEffect } from 'react';

import { BatteriesNavigatorParamList } from 'types/navigation';
import { Button } from '@rneui/base';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<BatteriesNavigatorParamList, 'Batteries'>;

const BatteriesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          title={'Edit'}
          titleStyle={theme.styles.buttonClearTitle}
          buttonStyle={[theme.styles.buttonClear, s.editButton]}
          onPress={() => null}
        />
      ),
      headerRight: ()  => {
        return (
          <>
            <Icon
              name={'filter'}
              style={s.headerIcon}/>
            <Icon
              name={'plus'}
              style={s.headerIcon}
              onPress={() => navigation.navigate('NewBattery')}/>
          </>
        );
      },
    });
  }, [navigation]);

  return (
    <SafeAreaView edges={['left', 'right']} style={theme.styles.view}>
      <ScrollView
        // contentContainerStyle={{ height: visibleViewHeight }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'READY TO CHARGE'}/>
        <ListItem
          title={'150S #1'}
          subtitle={'450mah 3S/1P 30C LiPo\n20 cycles\nDischarged on Nov 4, 2023, 9 days ago'}
          position={['first', 'last']}
          onPress={() => navigation.navigate('Battery', {
            batteryId: '1'
          })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  editButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  headerIcon: {
    color: theme.colors.brandPrimary,
    fontSize: 22,
    marginHorizontal: 10,
  },
}));

export default BatteriesScreen;