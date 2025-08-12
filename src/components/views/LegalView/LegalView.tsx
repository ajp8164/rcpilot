import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ContentView } from '@react-native-hello/ui';
import { makeStyles } from '@rn-vui/themed';
import { appConfig } from 'config';
import privacy from 'lib/content/privacy';
import terms from 'lib/content/terms';
import React from 'react';
import { Text, View } from 'react-native';
import TabController from 'react-native-ui-lib/tabController';
import { AppTheme, useTheme } from 'theme';

const LegalView = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  return (
    <View style={s.container}>
      <TabController
        items={[{ label: 'Service Agreement' }, { label: 'Privacy Policy' }]}>
        <TabController.TabBar
          backgroundColor={theme.colors.viewInvBackground}
          indicatorStyle={{ backgroundColor: theme.colors.stickyWhite }}
          labelColor={theme.colors.textInv}
          selectedLabelColor={theme.colors.textInv}
        />
        <TabController.TabPage index={0}>
          <BottomSheetScrollView
            style={s.tabContentContainer}
            showsVerticalScrollIndicator={false}>
            <Text
              style={
                s.title
              }>{`${appConfig.businessNameShort} \nService Agreement`}</Text>
            <ContentView items={terms} textStyle={s.text} />
          </BottomSheetScrollView>
        </TabController.TabPage>
        <TabController.TabPage index={1}>
          <BottomSheetScrollView
            style={s.tabContentContainer}
            showsVerticalScrollIndicator={false}>
            <Text
              style={
                s.title
              }>{`${appConfig.businessNameShort} \nPrivacy Policy`}</Text>
            <ContentView items={privacy} textStyle={s.text} />
          </BottomSheetScrollView>
        </TabController.TabPage>
      </TabController>
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    height: '100%',
  },
  tabContentContainer: {
    top: 48 + 10, // tab bar height plus some margin
    marginHorizontal: 15,
  },
  title: {
    ...theme.styles.textHeading1,
    color: theme.colors.textInv,
  },
  text: {
    ...theme.styles.textSmall,
    color: theme.colors.textInv,
  },
}));

export default LegalView;
