import React, { useEffect, useState } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemInput } from 'components/atoms/List';
import { ModelCategory } from 'realmdb/ModelCategory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { eqString } from 'realmdb/helpers';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useTheme } from 'theme';

// CompositeScreenProps not working here since NewModelCategory is also in the SetupNavigator
// just using a different presentation (didn't create a new navigator for a single screen).
export type Props =
  NativeStackScreenProps<SetupNavigatorParamList, 'ModelCategoryEditor'> |
  NativeStackScreenProps<SetupNavigatorParamList, 'NewModelCategory'>;

const ModelCategoryEditorScreen = ({ navigation, route }: Props) => {
  const { modelCategoryId } = route.params || {};
  const theme = useTheme();
  const setScreenEditHeader = useScreenEditHeader();

  const realm = useRealm();
  const modelCategory = useObject(ModelCategory, new BSON.ObjectId(modelCategoryId));

  const [name, setName] = useState(modelCategory?.name || undefined);

  useEffect(() => {
    const canSave = !!name && (
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

    setScreenEditHeader({enabled: canSave, action: onDone});
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

export default ModelCategoryEditorScreen;
