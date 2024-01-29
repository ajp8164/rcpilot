import { AppTheme, useTheme } from 'theme';
import { Pressable, ScrollView } from 'react-native';
import React, { useEffect } from 'react';

import { Button } from '@rneui/base';
import CustomIcon from 'theme/icomoon/CustomIcon';
import { Divider } from '@react-native-ajp-elements/ui';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { ListItem } from 'components/atoms/List';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'Models'>;

const ModelsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Edit'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.editButton]}
          />
        )
      },
      headerRight: ()  => {
        return (
          <>
            <Icon
              name={'filter'}
              style={s.headerIcon}
              onPress={() => navigation.navigate('ModelFiltersNavigator')}
              />
            <Icon
              name={'plus'}
              style={s.headerIcon}
              onPress={() => navigation.navigate('NewModelNavigator', {
                screen: 'NewModel',
                params: {}
              })}
            />
          </>
        );
      },
    });
  }, []);
  
  return (
    <SafeAreaView edges={['left', 'right']} style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'HELICOPTERS'}/>
        <ListItem
          title={'Blade 150S'}
          subtitle={'1 flight, last Nov 4, 2023\n0:04:00 total time, 4:00 average time'}
          position={['first', 'last']}
          onPress={() => navigation.navigate('FlightNavigator', {
            modelId: '123456789012'
          })}
          rightImage={
            <Pressable
              style={{flexDirection: 'row'}}
              onPress={() => navigation.navigate('ModelEditor', {
                modelId: '123456789012'
              })}>
              <CustomIcon
                name={'circle-info'}
                size={22}
                color={theme.colors.screenHeaderBackButton}
              />
            </Pressable>            
          }
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

export default ModelsScreen;
