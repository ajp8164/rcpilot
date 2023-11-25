import { AppTheme, useTheme } from 'theme';
import { Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { FlightOutcome } from 'types/flight';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { makeStyles } from '@rneui/themed';

interface FlightRatingInterface {
  value: FlightOutcome;
}

export const FlightRating = ({
  value,
}: FlightRatingInterface) => {
  const theme = useTheme();
  const s = useStyles(theme);

  const [element, setElement] = useState([<></>]);

  useEffect(() => {
    const outcomeEl = [];
    try {
      const num = parseInt(value);
      if (isNaN(num)) {
        throw 'NaN';
      }
      for (let  i = 0; i < num; i++) {
        outcomeEl.push(<Icon key={i} name={'star'} />);
      }
    } catch(_e: any) {
      if (value === FlightOutcome.Crashed) {
        outcomeEl.push(<Text style={theme.styles.textNormal}>{'Crashed'}</Text>);
      } else {
        outcomeEl.push(<Text style={theme.styles.textNormal}>{'Unspecified'}</Text>);
      }
    }
    setElement(outcomeEl);

  }, [value]);
    
  return (
    <View style={s.outcome}>
      {element}
     </View>
  );
};

const useStyles = makeStyles((_theme, __theme: AppTheme) => ({
  outcome: {
    flexDirection: 'row',
  }
}));
