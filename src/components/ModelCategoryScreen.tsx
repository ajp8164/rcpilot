import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemCheckbox } from 'components/atoms/List/ListItemCheckbox';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NewModelNavigatorParamList } from 'types/navigation';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<NewModelNavigatorParamList, 'ModelType'>;

const ModelCategoryScreen = () => {
  const theme = useTheme();

  const modelCategories = [
    { name: 'None' },
  ];

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={theme.styles.view}>
      <Divider />
      {modelCategories.map((category, index) => {
        return (
          <ListItemCheckbox
            key={index}
            title={category.name}
            position={modelCategories.length === 1 ? ['first', 'last'] : index === 0 ? ['first'] : index === modelCategories.length - 1 ? ['last'] : []}
            checked={true}
            onPress={() => null}
          />
        )
      })}
      <Divider text={'You can manage categories through the Globals section in the Setup tab.'} />
    </SafeAreaView>
  );
};

export default ModelCategoryScreen;
