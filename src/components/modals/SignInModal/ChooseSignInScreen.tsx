import { Alert, Platform, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React, { useState } from 'react';
import { getColoredSvg, getSvg } from '@react-native-ajp-elements/ui';
import {
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
} from 'lib/auth';

import { Button } from '@rn-vui/base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SignInNavigatorParamList } from './types';
import { SvgXml } from 'react-native-svg';
import { appConfig } from 'config';
import { makeStyles } from '@rn-vui/themed';

export type Props = NativeStackScreenProps<
  SignInNavigatorParamList,
  'ChooseSignInScreen'
>;

const ChooseSignInScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [signInAction, setSignInAction] = useState(true);

  return (
    <View style={theme.styles.viewAlt}>
      <Text style={s.title}>{appConfig.appName}</Text>
      {route.params?.msg && (
        <Text style={s.description}>{route.params?.msg}</Text>
      )}
      <Text style={s.subtitle}>
        {signInAction ? 'Sign In' : 'Create Account'}
      </Text>
      <Text style={s.footer}>
        {'By signing up you agree to our Terms and Privacy Policy'}
      </Text>
      <Button
        title={'Continue with Google'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={theme.styles.buttonOutline}
        containerStyle={s.signInButtonContainer}
        icon={
          <SvgXml
            width={28}
            height={28}
            style={s.googleIcon}
            xml={getSvg('googleIcon')}
          />
        }
        onPress={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signInWithGoogle().catch((e: any) => {
            Alert.alert('Sign In Error', e.message, [{ text: 'OK' }], {
              cancelable: false,
            });
          });
        }}
      />
      <Button
        title={'Continue with Facebook'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={theme.styles.buttonOutline}
        containerStyle={s.signInButtonContainer}
        icon={
          <SvgXml
            width={45}
            height={45}
            style={s.facebookIcon}
            xml={getSvg('facebookIcon')}
          />
        }
        onPress={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signInWithFacebook().catch((e: any) => {
            Alert.alert('Sign In Error', e.message, [{ text: 'OK' }], {
              cancelable: false,
            });
          });
        }}
      />
      {/* <Button
        title={'Continue with Twitter'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={theme.styles.buttonOutline}
        containerStyle={s.signInButtonContainer}
        icon={
          <SvgXml
            width={28}
            height={28}
            style={{ position: 'absolute', left: 5 }}
            xml={getSvg('twitterIcon')}
          />
        }
        onPress={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signInWithTwitter().catch((e: any) => {
            Alert.alert('Sign In Error', e.message, [{ text: 'OK' }], {
              cancelable: false,
            });
          });
        }}
      /> */}
      {Platform.OS === 'ios' && (
        <Button
          title={'Continue with Apple'}
          titleStyle={theme.styles.buttonOutlineTitle}
          buttonStyle={theme.styles.buttonOutline}
          containerStyle={s.signInButtonContainer}
          icon={
            <SvgXml
              width={30}
              height={30}
              style={s.appleIcon}
              color={theme.colors.black}
              xml={getColoredSvg('appleIcon')}
            />
          }
          onPress={() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            signInWithApple().catch((e: any) => {
              Alert.alert('Sign In Error', e.message, [{ text: 'OK' }], {
                cancelable: false,
              });
            });
          }}
        />
      )}
      <Button
        title={'Continue with Email'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={theme.styles.buttonOutline}
        containerStyle={s.signInButtonContainer}
        onPress={() =>
          signInAction
            ? navigation.navigate('EmailSignInScreen')
            : navigation.navigate('CreateAccountScreen')
        }
      />
      <Button
        title={signInAction ? 'or Create Account' : 'Have an Account? Sign In'}
        titleStyle={theme.styles.buttonClearTitle}
        buttonStyle={theme.styles.buttonClear}
        containerStyle={s.signInButtonContainer}
        onPress={() => setSignInAction(!signInAction)}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  description: {
    ...theme.styles.textNormal,
    ...theme.styles.textDim,
    textAlign: 'center',
    marginHorizontal: 40,
  },
  footer: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim,
    alignSelf: 'center',
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
    marginHorizontal: 40,
  },
  signInButtonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 15,
  },
  subtitle: {
    ...theme.styles.textHeading3,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    ...theme.styles.textHeading1,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  googleIcon: {
    position: 'absolute',
    left: 5,
  },
  facebookIcon: {
    position: 'absolute',
    left: -3,
  },
  appleIcon: {
    position: 'absolute',
    left: 3,
    top: 2,
  },
}));

export default ChooseSignInScreen;
