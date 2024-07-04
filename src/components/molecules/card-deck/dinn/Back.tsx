import { Image, LayoutChangeEvent, LayoutRectangle, Text, View } from 'react-native';
import { AppTheme, useTheme } from 'theme';
import React, { useState } from 'react';

import { makeStyles } from '@rneui/themed';
import { Model } from 'realmdb';
import { Button } from '@rneui/base';
import type FlipCardView from 'components/views/FlipCardView';

interface DinnCardInterface extends FlipCardView {
  model: Model;
}

export const Back = ({ model, flip }: DinnCardInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [cardLayout, setCardLayout] = useState<LayoutRectangle>();

  const primaryColor = '#102013';
  const accent1Color = '#777A15';
  // const accent2Color = '#4B5C21';

  const onLayout = (event: LayoutChangeEvent) => {
    setCardLayout(event.nativeEvent.layout);
  };

  return (
    <View style={[s.container, { backgroundColor: primaryColor }]} onLayout={onLayout}>
      <Text style={[s.title, { textAlign: 'left', color: accent1Color }]}>{model.name}</Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Image
          source={require('theme/img/buddy.png')}
          resizeMode={'cover'}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            width: cardLayout ? cardLayout.width * 0.33 : 0,
            height: cardLayout ? cardLayout?.width * 0.33 : 0,
          }}
        />
      </View>
      <Button
        title={'test'}
        titleStyle={theme.styles.buttonScreenHeaderTitle}
        buttonStyle={theme.styles.buttonScreenHeader}
        onPress={flip}
      />
    </View>
  );
};

const useStyles = makeStyles((_theme, theme: AppTheme) => ({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: theme.colors.stickyWhite,
    padding: 30,
  },
  background: {
    width: '100%',
    height: '35%',
    backgroundColor: theme.colors.stickyBlack,
    position: 'absolute',
    bottom: 0,
    borderTopWidth: 10,
    borderColor: theme.colors.darkGray,
  },
  title: {
    ...theme.styles.textXL,
    ...theme.styles.textBold,
    color: theme.colors.darkGray,
    marginBottom: 13,
  },
  text: {
    ...theme.styles.textSmall,
    color: theme.colors.darkGray,
    marginBottom: 5,
  },
}));
