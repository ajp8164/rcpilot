import React, { useEffect, useRef } from 'react';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemInput } from 'components/atoms/List';
import { ModelCategory } from 'realmdb/ModelCategory';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView } from 'react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { eqString } from 'realmdb/helpers';
import { useDebouncedRender } from 'lib/useDebouncedRender';
import { useScreenEditHeader } from 'lib/useScreenEditHeader';
import { useTheme } from 'theme';

// CompositeScreenProps not working here since NewModelCategory is also in the SetupNavigator
// just using a different presentation (didn't create a new navigator for a single screen).
export type Props =
  | NativeStackScreenProps<SetupNavigatorParamList, 'ModelCategoryEditor'>
  | NativeStackScreenProps<SetupNavigatorParamList, 'NewModelCategory'>;

const ModelCategoryEditorScreen = ({ navigation, route }: Props) => {
  const { modelCategoryId } = route.params || {};
  const theme = useTheme();
  const setScreenEditHeader = useScreenEditHeader();
  const setDebounced = useDebouncedRender();

  const realm = useRealm();
  const modelCategory = useObject(ModelCategory, new BSON.ObjectId(modelCategoryId));

  const name = useRef(modelCategory?.name || undefined);

  useEffect(() => {
    const canSave = !!name.current && !eqString(modelCategory?.name, name.current);

    const save = () => {
      if (modelCategory) {
        realm.write(() => {
          modelCategory.name = name.current || 'no-name';
        });
      } else {
        realm.write(() => {
          realm.create('ModelCategory', {
            name: name.current,
          });
        });
      }
    };

    const onDone = () => {
      save();
      navigation.goBack();
    };

    setScreenEditHeader({ enabled: canSave, action: onDone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name.current]);

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItemInput
        value={name.current}
        placeholder={'Name for the category'}
        position={['first', 'last']}
        onChangeText={value => setDebounced(() => (name.current = value))}
      />
    </ScrollView>
  );
};

export default ModelCategoryEditorScreen;
