import { AppTheme, useTheme } from 'theme';
import { Text, View, ViewStyle } from 'react-native';
import { useEffect, useState } from 'react';

import { EventOutcome } from 'types/event';
import Icon from 'react-native-vector-icons/FontAwesome6';
import React from 'react';
import { makeStyles } from '@rneui/themed';

interface EventRatingInterface {
  style?: ViewStyle | ViewStyle[];
  value?: EventOutcome;
}

export const EventRating = ({ style = {}, value }: EventRatingInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [element, setElement] = useState(<></>);

  useEffect(() => {
    const outcomeEl = [];
    try {
      if (!value) {
        throw '';
      }
      const num = parseInt(value, 10);

      if (isNaN(num)) {
        throw 'NaN';
      }

      for (let i = 0; i < num; i++) {
        outcomeEl.push(
          <View style={style}>
            <Icon key={i} name={'star'} size={20} style={s.icon} color={theme.colors.midGray} />
          </View>,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (_e: any) {
      if (value === EventOutcome.Crashed) {
        outcomeEl.push(
          <Text key={'crashed'} style={theme.styles.textNormal}>
            {'Crashed'}
          </Text>,
        );
      } else {
        outcomeEl.push(
          <Text key={'unspecified'} style={theme.styles.textNormal}>
            {'Unspecified'}
          </Text>,
        );
      }
    }
    setElement(<View style={s.outcome}>{outcomeEl}</View>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return element;
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  outcome: {
    flexDirection: 'row',
  },
  icon: {
    width: 22,
  },
}));
