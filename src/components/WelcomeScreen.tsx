import { AppTheme, useTheme } from 'theme';
import { Platform, ScrollView, StatusBar, Text } from 'react-native';
import React, { useRef } from 'react';

import { CheckBox } from '@rneui/base';
import { LegalModal } from 'components/modals/LegalModal';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { dispatch } from 'store';
import { makeStyles } from '@rneui/themed';
import { saveAcceptTou } from 'store/slices/appSettings';
import { selectTou } from 'store/selectors/appSettingsSelectors';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { viewport } from '@react-native-ajp-elements/ui';

const WelcomeScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);
  const insets = useSafeAreaInsets();
  const visibleHeight =
    viewport.height -
    insets.top -
    insets.bottom -
    (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);

  const legalModalRef = useRef<LegalModal>(null);
  const tou = useSelector(selectTou);

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.colors.brandSecondary);
        SystemNavigationBar.setNavigationColor(
          theme.colors.brandPrimary,
          'light',
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const agreement = () => {
    return (
      <CheckBox
        center
        title={
          <Text style={s.termsTextContainer}>
            {'I accept the '}
            <Text
              style={s.termsText}
              suppressHighlighting={true}
              onPress={legalModalRef.current?.present}>
              {'Terms of Service'}
            </Text>
          </Text>
        }
        containerStyle={s.checkboxContainer}
        iconType={'ionicon'}
        checkedIcon={'checkbox-outline'}
        uncheckedIcon={'square-outline'}
        checkedColor={theme.colors.stickyWhite}
        uncheckedColor={
          theme.mode === 'light'
            ? theme.colors.whiteTransparentMid
            : theme.colors.blackTransparentMid
        }
        checked={tou.accepted !== undefined}
        onPress={() => {
          const accepted =
            tou.accepted === undefined ? new Date().toISOString() : undefined;
          dispatch(saveAcceptTou({ tou: { accepted } }));
        }}
      />
    );
  };

  return (
    <>
      <ScrollView
        style={theme.styles.viewInv}
        contentInsetAdjustmentBehavior={'always'}
        overScrollMode={'always'}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ height: visibleHeight }}>
        {agreement()}
      </ScrollView>
      <LegalModal ref={legalModalRef} />
    </>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  checkboxContainer: {
    backgroundColor: theme.colors.transparent,
    alignSelf: 'flex-start',
  },
  termsTextContainer: {
    ...theme.styles.textSmall,
    color: theme.colors.textInv,
    left: 5,
  },
  termsText: {
    ...theme.styles.link,
    ...theme.styles.textSmall,
    color: theme.colors.textInv,
  },
}));

export default WelcomeScreen;
