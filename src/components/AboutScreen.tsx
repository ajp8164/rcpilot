import React from 'react';
import { ScrollView, Text } from 'react-native';
import VersionNumber from 'react-native-version-number';

import {
  Divider,
  ListItem,
  ThemeManager,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import helpContent from 'lib/content/helpContent';
import legalContent from 'lib/content/legalContent';
import { SetupNavigatorParamList } from 'types/navigation';

type Props = NativeStackScreenProps<SetupNavigatorParamList, 'About'>;

const AboutScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  const tabBarHeight = useBottomTabBarHeight();
  const headerBarLargeHeight = device.headerBarLarge.height as number;
  const visibleViewHeight =
    device.screen.height - tabBarHeight - headerBarLargeHeight;

  return (
    <ScrollView
      style={theme.styles.view}
      contentContainerStyle={{ height: visibleViewHeight }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItem
        title={'Help'}
        position={['first']}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('Content', {
            content: helpContent,
          })
        }
      />
      <ListItem
        title={'Legal'}
        position={['last']}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('Content', {
            content: legalContent,
          })
        }
      />
      <Divider
        note
        text={
          'This log shows the activity of the application and can be useful for app support.'
        }
      />
      <Text style={s.version}>
        {`App Version ${VersionNumber.appVersion}.${VersionNumber.buildVersion}`}
      </Text>
    </ScrollView>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  version: {
    position: 'absolute',
    bottom: 15,
    ...theme.text.small,
    ...theme.styles.textDim,
    alignSelf: 'center',
    marginTop: 25,
  },
}));

export default AboutScreen;
