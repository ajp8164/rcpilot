import { ModelCategoryEditorViewMethods, ModelCategoryEditorViewProps } from './types';

import { Divider } from '@react-native-ajp-elements/ui';
import {ListItemInput} from 'components/atoms/List';
import { ModelCategory } from 'types/model';
import React from 'react';
import { View } from 'react-native';
import { useSetState } from '@react-native-ajp-elements/core';

type ModelCategoryEditorView = ModelCategoryEditorViewMethods;

const ModelCategoryEditorView = (props: ModelCategoryEditorViewProps) => {
  const { modelCategoryId } = props;

  const mockModelCategory: ModelCategory = {
    id: modelCategoryId || '-1',
    name: 'SABx',
  };

  const [modelCategory, setModelCategory] = useSetState<ModelCategory>(mockModelCategory);

  return (
    <View>
      <Divider />
      <ListItemInput
        value={mockModelCategory.name}
        placeholder={'Name for the category'}
        position={['first', 'last']}
        onChangeText={() => null}
      /> 
    </View>
  );
};

export default ModelCategoryEditorView;
