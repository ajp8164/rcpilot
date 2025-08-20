import { useEffect, useRef } from 'react';
import { accelerometer } from 'react-native-sensors';

import { log, useEvent } from '@react-native-hello/core';
import { filter, map } from 'rxjs/operators';

const SHAKE_THRESHOLD = 26;
const MIN_TIME_BETWEEN_SHAKES_MILLISECS = 1000;

export const useDeviceShake = () => {
  const lastShakeTime = useRef(0);
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
    if (!sensorAvailable) return;

    const subscription = accelerometer
      .pipe(
        map(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z)),
        filter(magnitude => {
          const now = new Date().getTime();
          if (
            magnitude > SHAKE_THRESHOLD &&
            now - lastShakeTime.current > MIN_TIME_BETWEEN_SHAKES_MILLISECS
          ) {
            lastShakeTime.current = now;
            return true;
          }
          return false;
        }),
      )
      .subscribe({
        next: magnitude => {
          event.emit('deviceShake', { magnitude });
        },
        error: error => {
          log.warn('Accelerometer on shake:', error);
        },
      });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
