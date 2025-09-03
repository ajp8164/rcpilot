import { useEffect, useRef, useState } from 'react';
import { Platform, Vibration } from 'react-native';
import { accelerometer } from 'react-native-sensors';

import { log, useEvent } from '@react-native-hello/core';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

const SHAKE_THRESHOLD = 8;
const MIN_TIME_BETWEEN_SHAKES = 1000; // ms

export const useDeviceShake = () => {
  const event = useEvent();

  const lastShakeTime = useRef<DateTime<true>>(DateTime.now());
  const sensorAvailable = useRef(true);
  const subscription = useRef<Subscription>(null);

  const [enabled, setEnabled] = useState(false);

  // Simple check to see if device shake is available.
  useEffect(() => {
    const subscription = accelerometer.subscribe({
      next: () => {
        sensorAvailable.current = true;
        subscription.unsubscribe();
        log.debug('Accelerometer available');
      },
      error: error => {
        sensorAvailable.current = false;
        log.warn('Accelerometer:', error);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sensorAvailable.current || !enabled) {
      subscription.current?.unsubscribe();
      return;
    }

    subscription.current = accelerometer
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
          runVibrate(2);
          event.emit('device-shake', { magnitude });
        },
        error: error => {
          log.warn('Accelerometer on shake:', error);
        },
      });

    return () => subscription.current?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    isAvailable: sensorAvailable.current,
    isEnabled: enabled,
    disable: () => setEnabled(false),
    enable: () => setEnabled(true),
  };
};

const runVibrate = (times = 3, duration = 200, gap = 100) => {
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
