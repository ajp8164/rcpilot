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
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { eqString } from 'realmdb/helpers';
import { makeStyles } from '@rneui/themed';

// CompositeScreenProps not working here since NewModelCategory is also in the SetupNavigator
// just using a different presentation (didn't create a new navigator for a single screen).
export type Props =
  NativeStackScreenProps<SetupNavigatorParamList, 'ModelCategoryEditor'> |
  NativeStackScreenProps<SetupNavigatorParamList, 'NewModelCategory'>;

const ModelCategoryEditorScreen = ({ navigation, route }: Props) => {
  const { modelCategoryId } = route.params || {};
  const theme = useTheme();
  const s = useStyles(theme);

  const realm = useRealm();
  const modelCategory = useObject(ModelCategory, new BSON.ObjectId(modelCategoryId));

  const [name, setName] = useState(modelCategory?.name || undefined);

  useEffect(() => {
    const canSave = name && (
      !eqString(modelCategory?.name, name)
    );

    const save = () => {
      if (modelCategory) {
        realm.write(() => {
          modelCategory.name = name!;
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider />
        <ListItemInput
          value={name}
          placeholder={'Name for the category'}
          position={['first', 'last']}
          onChangeText={setName}
        />
      </ScrollView>
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
