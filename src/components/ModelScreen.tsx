import { AppTheme, useTheme } from 'theme';
import React, { useEffect } from 'react';

import Icon from 'react-native-vector-icons/FontAwesome6';
import ModelView from 'components/views/ModelView';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { makeStyles } from '@rneui/themed';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'Model'>;

const ModelScreen = ({ route, navigation }: Props) => {
  const { modelId } = route.params;
  
  const theme = useTheme();
  const s = useStyles(theme);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ()  => {
        return (
          <>
            <Icon
              name={'chevron-up'}
              style={s.headerIcon}
              onPress={() => null}/>
            <Icon
              name={'chevron-down'}
              style={s.headerIcon}
              onPress={() => null}/>
          </>
        );
      },
    });
  }, []);

  return (
    <View style={theme.styles.view}>
      <ModelView modelId={modelId} />
    </View>
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

export default ModelScreen;
