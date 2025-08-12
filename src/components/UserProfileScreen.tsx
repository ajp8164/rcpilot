import { CompositeScreenProps } from '@react-navigation/core';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import UserProfileView, { EditorState } from 'components/views/UserProfileView';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useTheme } from 'theme';
import {
  MainNavigatorParamList,
  SetupNavigatorParamList,
} from 'types/navigation';

type Props = CompositeScreenProps<
  NativeStackScreenProps<SetupNavigatorParamList, 'UserProfile'>,
  NativeStackScreenProps<MainNavigatorParamList>
>;

const UserProfileScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();

  const [userProfile, _setUserProfile] = useState(route.params.userProfile);
  const [editorState, setEditorState] = useState({} as EditorState);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            {editorState.isSubmitting ? (
              <ActivityIndicator color={theme.colors.brandPrimary} />
            ) : null}
          </>
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState, theme.colors.brandPrimary]);

  return (
    <View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <UserProfileView
          userProfile={userProfile}
          onEditorStateChange={setEditorState}
        />
      </ScrollView>
    </View>
  );
};

export default UserProfileScreen;
