import { eventOutcomeIcons } from 'lib/modelEvent';
import { ReactElement, useEffect, useState } from 'react';
import React from 'react';
import { Text } from 'react-native';
import { useTheme } from 'theme';
import { EventOutcome } from 'types/event';

interface EventRatingInterface {
  value?: EventOutcome;
}

export const EventRating = ({ value }: EventRatingInterface) => {
  const theme = useTheme();

  const [element, setElement] = useState(<></>);

  useEffect(() => {
    let outcomeEl: ReactElement;
    try {
      if (!value) {
        throw '';
      }
      const num = parseInt(value, 10);

      if (isNaN(num)) {
        throw 'NaN';
      }

      outcomeEl = eventOutcomeIcons[value]?.leftContent || <></>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (_e: any) {
      if (value === EventOutcome.Crashed) {
        outcomeEl = (
          <Text key={'crashed'} style={theme.styles.textNormal}>
            {'Crashed'}
          </Text>
        );
      } else {
        outcomeEl = (
          <Text key={'unspecified'} style={theme.styles.textNormal}>
            {'Unspecified'}
          </Text>
        );
      }
    }
    setElement(outcomeEl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return element;
};
