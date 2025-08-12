import * as Yup from 'yup';
import { SignInNavigatorParamList } from './types';
import { useSetState } from '@react-native-hello/core';
import {
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItemInput,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { makeStyles } from '@rn-vui/themed';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { createUserWithEmailAndPassword } from 'lib/auth';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import { AppTheme, useTheme } from 'theme';

enum Fields {
  firstName,
  lastName,
  email,
  password,
}

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export interface EditorState {
  isSubmitting: boolean;
  focusedField?: number;
  fieldCount: number;
}

export type Props = NativeStackScreenProps<
  SignInNavigatorParamList,
  'CreateAccountScreen'
>;

const CreateAccountScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const firstNameFieldRef = useRef<TextInput | null>(null);
  const lastNameFieldRef = useRef<TextInput>(null);
  const emailFieldRef = useRef<TextInput>(null);
  const passwordFieldRef = useRef<TextInput>(null);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  // Same order as on form.
  const fieldRefs = [emailFieldRef.current, passwordFieldRef.current];

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [editorState, setEditorState] = useSetState<EditorState>({
    fieldCount: fieldRefs.length,
    focusedField: undefined,
    isSubmitting: false,
  });

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [
        firstNameFieldRef.current,
        lastNameFieldRef.current,
        emailFieldRef.current,
        passwordFieldRef.current,
      ].filter(Boolean),
    );
  }, []);

  const signIn = (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>,
  ) => {
    Keyboard.dismiss();
    setEditorState({ isSubmitting: true });
    createUserWithEmailAndPassword(
      values.firstName,
      values.lastName,
      values.email,
      values.password,
    )
      .then(() => {
        setEditorState({ isSubmitting: false });
        resetForm({ values });
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => {
        setEditorState({ isSubmitting: false });
        Alert.alert('Account Error', e.message, [{ text: 'OK' }], {
          cancelable: false,
        });
      });
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string()
      .email('Not a valid email address')
      .matches(/\..{2,}$/, 'Email domain needs min 2 characters') // Email domain at least 2 chars
      .required('Email address is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Minimum length 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
        'Include uppercase, lowercase, number and one of !@#$%^&*',
      ),
  });

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);
  };

  return (
    <>
      <AvoidSoftInputView style={s.avoidContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.container}>
          <Formik
            innerRef={formikRef}
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
            }}
            validateOnMount={true}
            validationSchema={validationSchema}
            onSubmit={signIn}>
            {({ dirty, errors, handleChange, isValid, submitForm, values }) => (
              <View>
                <FormikStateWatcher<FormValues>
                  onChange={onFormikWatcherStateChange}
                />
                <View style={[theme.styles.viewAlt, s.view]}>
                  <ListItemInput
                    ref={ref => {
                      ref && (firstNameFieldRef.current = ref);
                    }}
                    error={!!errors.firstName}
                    inputProps={{
                      value: values.firstName,
                      onChangeText: handleChange('firstName'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(
                          Fields.firstName,
                        ),
                      placeholder: 'First Name',
                      autoCapitalize: 'none',
                      autoCorrect: false,
                    }}
                  />
                  <ListItemInput
                    ref={ref => {
                      ref && (lastNameFieldRef.current = ref);
                    }}
                    error={!!errors.lastName}
                    inputProps={{
                      value: values.lastName,
                      onChangeText: handleChange('lastName'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(
                          Fields.lastName,
                        ),
                      placeholder: 'Last Name',
                      autoCapitalize: 'none',
                      autoCorrect: false,
                    }}
                  />
                  <ListItemInput
                    ref={ref => {
                      ref && (emailFieldRef.current = ref);
                    }}
                    error={!!errors.email}
                    inputProps={{
                      value: values.email,
                      onChangeText: handleChange('email'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(Fields.email),
                      placeholder: 'Email',
                      keyboardType: 'email-address',
                      autoCapitalize: 'none',
                      autoCorrect: false,
                    }}
                  />
                  <ListItemInput
                    ref={ref => {
                      ref && (passwordFieldRef.current = ref);
                    }}
                    error={!!errors.password}
                    rightContent={
                      passwordVisible ? (
                        <EyeOff color={theme.colors.black} />
                      ) : (
                        <Eye color={theme.colors.black} />
                      )
                    }
                    onPressRight={() => setPasswordVisible(!passwordVisible)}
                    inputProps={{
                      value: values.password,
                      onChangeText: handleChange('password'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(
                          Fields.password,
                        ),
                      placeholder: 'Password',
                      secureTextEntry: !passwordVisible,
                    }}
                  />
                  <Button
                    title={'Continue'}
                    titleStyle={theme.styles.buttonTitle}
                    buttonStyle={theme.styles.button}
                    containerStyle={s.continueButtonContainer}
                    disabled={!(dirty && isValid)}
                    loading={editorState.isSubmitting}
                    onPress={() => submitForm()}
                  />
                  <Text style={s.footer}>
                    {'By signing up you agree to our Terms and Privacy Policy'}
                  </Text>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </AvoidSoftInputView>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={resolvedRefs}
        doneText={'Submit'}
        disabledDone={!formikCanSubmit}
        onDone={() => formikRef.current?.handleSubmit()}
      />
    </>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  avoidContainer: {
    flex: 1,
  },
  container: {
    height: '100%',
  },
  view: {
    paddingTop: 30,
  },
  continueButtonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 30,
  },
  forgotPasswordButtonContainer: {
    marginTop: 15,
  },
  forgotPassword: {
    ...theme.styles.textSmall,
    ...theme.styles.textDim,
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
}));

export default CreateAccountScreen;
