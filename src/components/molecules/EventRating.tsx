import { AppTheme, useTheme } from 'theme';
import { Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { EventOutcome } from 'types/event';
import Icon from 'react-native-vector-icons/FontAwesome6';
import React from 'react';
import { makeStyles } from '@rneui/themed';

interface EventRatingInterface {
  value?: EventOutcome;
}

export const EventRating = ({
  value,
}: EventRatingInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [element, setElement] = useState(<></>);

  useEffect(() => {
    const outcomeEl = [];
    try {
      const num = parseInt(value!);

      if (isNaN(num)) {
        throw 'NaN';
      }

      for (let i = 0; i < num; i++) {
        outcomeEl.push(
          <Icon
            key={i}
            name={'star'}
            size={20}
            style={{width: 22}}
            color={theme.colors.midGray}
          />
        );
      }
    } catch(_e: any) {
      if (value === EventOutcome.Crashed) {
        outcomeEl.push(<Text key={'crashed'} style={theme.styles.textNormal}>{'Crashed'}</Text>);
      } else {
        outcomeEl.push(<Text key={'unspecified'} style={theme.styles.textNormal}>{'Unspecified'}</Text>);
      }
    }
    setElement(<View style={s.outcome}>{outcomeEl}</View>);
  }, [ value ]);
    
  return (element);
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  outcome: {
    flexDirection: 'row',
  }
}));
