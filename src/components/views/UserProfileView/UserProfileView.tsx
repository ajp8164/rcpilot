import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import { openComposer } from 'react-native-email-link';
import { useSelector } from 'react-redux';

import { useSetState } from '@react-native-hello/core';
import {
  Asset,
  Divider,
  ListItem,
  ThemeManager,
  selectImage,
  useTheme,
} from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { Avatar } from 'components/molecules/Avatar';
import { appConfig } from 'config';
import { updateUser } from 'firebase/firestore';
import {
  Image as ImageUpload,
  deleteImage,
  uploadImage,
} from 'firebase/storage';
import { SquarePen } from 'lucide-react-native';
import { selectUserProfile } from 'store/selectors/userSelectors';
import { UserProfile } from 'types/user';

import {
  EditorState,
  UserProfileViewMethods,
  UserProfileViewProps,
} from './types';

type UserProfileView = UserProfileViewMethods;

const UserProfileView = React.forwardRef<UserProfileView, UserProfileViewProps>(
  (props, ref) => {
    const {
      userProfile: userProfileProp,
      onEditorStateChange,
      style = 'screen',
    } = props;

    const theme = useTheme();
    const s = useStyles();

    const [userProfile, setUserProfile] = useState(userProfileProp);
    const myUserProfile = useSelector(selectUserProfile);
    const isMyUserProfile = useRef(userProfileProp.id === myUserProfile?.id);

    const userProfileImageAsset = useRef<Asset>(null);
    const userProfileImageUrl = useRef(userProfile.photoUrl);

    const [editorState, setEditorState] = useSetState<EditorState>({
      isSubmitting: false,
    });

    useImperativeHandle(ref, () => ({
      //  These functions exposed to the parent component through the ref.
    }));

    useEffect(() => {
      onEditorStateChange?.(editorState);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editorState]);

    useEffect(() => {
      // Wait until the user profile is updated after a save.
      setEditorState({ isSubmitting: false });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile]);

    const saveUserProfile = async () => {
      const u: UserProfile = {
        ...userProfile,
        photoUrl: userProfileImageUrl.current,
      };

      try {
        await updateUser(u);
        setUserProfile(u);
        setEditorState({ isSubmitting: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setEditorState({ isSubmitting: false });
        Alert.alert(
          'Profile Not Saved',
          'Please try again.',
          [{ text: 'OK' }],
          {
            cancelable: false,
          },
        );
      }
    };

    const selectUserProfileImage = () => {
      selectImage({
        onSuccess: imageAssets => {
          userProfileImageAsset.current = imageAssets[0];
          saveUserProfileImage();
        },
      });
    };

    const saveUserProfileImage = async () => {
      if (userProfileImageAsset.current) {
        setEditorState({ isSubmitting: true });
        await uploadImage({
          image: {
            mimeType: userProfileImageAsset.current.type,
            uri: userProfileImageAsset.current.uri,
          } as ImageUpload,
          storagePath: appConfig.storageImageUsers,
          oldImage: userProfile?.photoUrl,
          onSuccess: (url: string) => {
            userProfileImageUrl.current = url;
            saveUserProfile();
          },
          onError: () => {
            return;
          },
        });
      }
    };

    const deleteUserProfileImage = async () => {
      if (userProfile?.photoUrl.length) {
        setEditorState({ isSubmitting: true });
        await deleteImage({
          filename: userProfile.photoUrl,
          storagePath: appConfig.storageImageUsers,
        })
          .then(() => {
            userProfileImageUrl.current = userProfile.photoUrlDefault;
            saveUserProfile();
          })
          .catch(() => {
            Alert.alert(
              'Image Not Deleted',
              'This image could not be deleted. Please try again.',
              [{ text: 'OK' }],
              { cancelable: false },
            );
          });
      }
    };

    const openEmail = (emailAddress: string) => {
      openComposer({
        to: emailAddress,
      }).catch(() => {
        //
      });
    };

    const renderUserProfileHeader = () => {
      return (
        <View style={s.userProfileHeaderContainer}>
          <Avatar
            userProfile={userProfile}
            size={'giant'}
            avatarStyle={s.avatar}
          />
          <Text style={s.userProfileNameText}>{userProfile.name}</Text>
        </View>
      );
    };

    const renderEditableUserProfileHeader = () => {
      return (
        <>
          <TouchableWithoutFeedback onPress={selectUserProfileImage}>
            <View style={s.userProfileHeaderContainer}>
              <Avatar
                userProfile={userProfile}
                size={'giant'}
                avatarStyle={s.avatar}
              />
              <View style={s.userProfileImageEditIcon}>
                <SquarePen color={theme.colors.darkGray} size={28} />
              </View>
            </View>
          </TouchableWithoutFeedback>
          {userProfile.photoUrl && (
            <Button
              type={'clear'}
              title={'Delete photo'}
              titleStyle={s.userProfileImageDeleteTitle}
              buttonStyle={s.deletePhotoButton}
              containerStyle={s.userProfileImageDeleteContainer}
              disabled={userProfile.photoUrl === userProfile.photoUrlDefault}
              onPress={deleteUserProfileImage}
            />
          )}
          <Text style={s.userProfileNameText}>{userProfile.name}</Text>
        </>
      );
    };

    const renderUserProfileDetails = () => {
      return (
        <>
          <Divider text={'EMAIL'} />
          <ListItem
            title={userProfile.email}
            position={['first', 'last']}
            containerStyle={style === 'modal' ? s.modalListContainer : {}}
            onPress={() => openEmail(userProfile.email)}
          />
        </>
      );
    };

    return (
      <>
        <AvoidSoftInputView
          style={style === 'screen' ? theme.styles.view : theme.styles.viewAlt}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.container}>
            {isMyUserProfile.current
              ? renderEditableUserProfileHeader()
              : renderUserProfileHeader()}
            {renderUserProfileDetails()}
          </ScrollView>
        </AvoidSoftInputView>
      </>
    );
  },
);

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  avatar: {
    alignSelf: 'center',
    marginTop: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  container: {
    paddingBottom: 50,
  },
  deletePhotoButton: {
    padding: 0,
  },
  modalListContainer: {
    backgroundColor: theme.colors.subtleGray,
  },
  userProfileHeaderContainer: {
    alignSelf: 'center',
  },
  userProfileImageEditIcon: {
    position: 'absolute',
    top: 80,
    left: 80,
    alignSelf: 'center',
  },
  userProfileImageDeleteContainer: {
    marginTop: -10,
    alignSelf: 'center',
  },
  userProfileImageDeleteTitle: {
    ...theme.text.small,
    color: theme.colors.assertive,
  },
  userProfileNameText: {
    ...theme.text.xl,
    fontFamily: theme.fonts.bold,
    textAlign: 'center',
    height: 50,
  },
}));

export default UserProfileView;
