import { AppTheme, useTheme } from 'theme';
import React, { useState } from 'react';

import { Divider } from '@react-native-ajp-elements/ui';
import { ListItemSwitch } from 'components/atoms/List';
import { ScrollView } from 'react-native';
import { makeStyles } from '@rneui/themed';

const PreferencesBatteriesScreen = () => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [defaultToFullChargeEnabled, setAtFieldSingleTapEnabled] = useState(false);
  const [hideStoredPacksEnabled, setHideStoredPacksEnabled] = useState(false);
  const [autofillPerPackEnabled, setAutofillPerPackEnabled] = useState(false);
  const [autofillPerCellEnabled, setAutofillPerCellEnabled] = useState(false);

  const toggleDefaultToFullCharge = (value: boolean) => {
    setAtFieldSingleTapEnabled(value);
  };

  const toggleHideStoredPacks = (value: boolean) => {
    setHideStoredPacksEnabled(value);
  };

  const toggleAutofillPerPack = (value: boolean) => {
    setAutofillPerPackEnabled(value);
  };

  const toggleAutofillPerCell = (value: boolean) => {
    setAutofillPerCellEnabled(value);
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItemSwitch
        title={'Default to Full Charge'}
        value={defaultToFullChargeEnabled}
        position={['first']}
        onValueChange={toggleDefaultToFullCharge}
      />
      <ListItemSwitch
        title={'Hide Stored Packs for Events'}
        value={hideStoredPacksEnabled}
        onValueChange={toggleHideStoredPacks}
      />
      <ListItemSwitch
        title={'Autofill Per-Pack Values'}
        value={autofillPerPackEnabled}
        onValueChange={toggleAutofillPerPack}
      />
      <ListItemSwitch
        title={'Autofill Per-Cell Values'}
        value={autofillPerCellEnabled}
        position={['last']}
        onValueChange={toggleAutofillPerCell}
      />
    </ScrollView>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  sliderContainer: {
    paddingHorizontal: 5,
  },
}));

export default PreferencesBatteriesScreen;
