import React, { useLayoutEffect, useState } from 'react';
import { SearchCriteria, SearchScope } from 'types/location';
import { Text, View } from 'react-native';

import ActionBar from 'components/atoms/ActionBar';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupNavigatorParamList } from 'types/navigation';
import { useTheme } from 'theme';

const initialSearchCriteria = { text: '', scope: SearchScope.FullText };

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Locations'>;

const LocationsScreen = ({ navigation }: Props) => {
  const theme = useTheme();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(
    initialSearchCriteria,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        autoCapitalize: 'none',
        hideNavigationBar: true,
        onChangeText: event =>
          setSearchCriteria({
            text: event.nativeEvent.text,
            scope: SearchScope.FullText,
          }),
        onBlur: () => setSearchFocused(false),
        onCancelButtonPress: resetSearch,
        onFocus: () => setSearchFocused(true),
      },
    });
  }, [navigation]);

  const resetSearch = () => {
    setSearchFocused(false);
    setSearchCriteria(initialSearchCriteria);
  };

  return (
    <View style={theme.styles.view}>
      <Text>{'Map here'}</Text>
      <ActionBar
        actions={[
          {
            ActionComponent: (<Icon name={'location-arrow'} size={28} color={theme.colors.brandPrimary} />),
            onPress: () => null
          }, {
            ActionComponent: (<Icon name={'location-dot'} size={28} color={theme.colors.brandPrimary} />),
            onPress: () => null
          }, {
            ActionComponent: (<Icon name={'satellite'} size={28} color={theme.colors.brandPrimary} />),
            onPress: () => null
          }, {
            label: 'Done',
            onPress: navigation.goBack
          },
        ]}
      />
    </View>
  );
};

export default LocationsScreen;
