import { AppTheme, useTheme } from 'theme';
import React, { useEffect, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Button } from '@rneui/base';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemInput } from 'components/atoms/List';
import { ModelCategory } from 'realmdb/ModelCategory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SetupNavigatorParamList } from 'types/navigation';
import { makeStyles } from '@rneui/themed';

export type Props =
  NativeStackScreenProps<SetupNavigatorParamList, 'ModelCategoryEditor'> |
  NativeStackScreenProps<SetupNavigatorParamList, 'NewModelCategory'>;

const ModelCategoryEditorScreen = ({ navigation, route }: Props) => {
  const { modelCategoryId } = route.params || {};
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();
  const modelCategory = modelCategoryId ? useObject(ModelCategory, new BSON.ObjectId(modelCategoryId)) : null;
  const [name, setName] = useState(modelCategory?.name || '');

  useEffect(() => {
    const canSave = name.length > 0 && name !== modelCategory?.name;

    const save = () => {
      if (modelCategory) {
        realm.write(() => {
          modelCategory.name = name;
        });
      } else {
        realm.write(() => {
          realm.create('ModelCategory', {
            name
          });
        });
      }
    };
  
    const onDone = () => {
      save();
      navigation.goBack();
    };

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonClearTitle}
            buttonStyle={[theme.styles.buttonClear, s.cancelButton]}
            onPress={navigation.goBack}
          />
        )
      },
      headerRight: () => {
        if (canSave) {
          return (
            <Button
              title={'Done'}
              titleStyle={theme.styles.buttonClearTitle}
              buttonStyle={[theme.styles.buttonClear, s.doneButton]}
              onPress={onDone}
            />
          )
        }
      },
    });
  }, [name]);

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      <ListItemInput
        value={name}
        placeholder={'Name for the category'}
        position={['first', 'last']}
        onChangeText={setName}
      /> 
    </SafeAreaView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  cancelButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
  doneButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: 0,
  },
}));

export default ModelCategoryEditorScreen;
