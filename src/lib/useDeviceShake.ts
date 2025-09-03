import { useEffect, useRef } from 'react';
import { Platform, Vibration } from 'react-native';
import { accelerometer } from 'react-native-sensors';

import { log, useEvent } from '@react-native-hello/core';
import { DateTime } from 'luxon';
import { filter, map } from 'rxjs/operators';

const SHAKE_THRESHOLD = 8;
const MIN_TIME_BETWEEN_SHAKES = 1000; // ms

export const useDeviceShake = () => {
  const lastShakeTime = useRef<DateTime<true>>(DateTime.now());
  const sensorAvailable = useRef(false);

  const event = useEvent();

  useEffect(() => {
    const subscription = accelerometer.subscribe({
      next: () => {},
      error: error => {
        log.warn('Accelerometer:', error);
        sensorAvailable.current = false;
      },
    });

    subscription.unsubscribe();
    sensorAvailable.current = true;
    log.debug('Accelerometer available');
  }, []);

  useEffect(() => {
    if (!sensorAvailable.current) return;

    const subscription = accelerometer
      .pipe(
        map(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z)),
        filter(magnitude => {
          const now = DateTime.now();
          if (
            magnitude > SHAKE_THRESHOLD &&
            now.diff(lastShakeTime.current).milliseconds >
              MIN_TIME_BETWEEN_SHAKES
          ) {
            lastShakeTime.current = now;
            return true;
          }
          return false;
        }),
      )
      .subscribe({
        next: magnitude => {
          vibrate(3);
          event.emit('device-shake', { magnitude });
        },
        error: error => {
          log.warn('Accelerometer on shake:', error);
        },
      });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const vibrate = (times = 3, duration = 200, gap = 300) => {
  if (Platform.OS === 'android') {
    const pattern: number[] = [0];
    for (let i = 0; i < times; i++) {
      pattern.push(duration);
      if (i < times - 1) pattern.push(gap);
    }
    Vibration.vibrate(pattern);
  } else {
    let count = 0;
    const trigger = () => {
      Vibration.vibrate();
      count++;
      if (count < times) {
        // Wait a min time to allow for successive vibrations.
        setTimeout(trigger, 550);
      }
    };
    trigger();
  }
};
