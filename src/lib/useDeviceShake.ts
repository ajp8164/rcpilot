import { log } from '@react-native-hello/core';
import { useEvent } from 'lib/event';
import { useEffect, useState } from 'react';
import { accelerometer } from 'react-native-sensors';
import { filter, map } from 'rxjs/operators';

const SHAKE_THRESHOLD = 26;
const MIN_TIME_BETWEEN_SHAKES_MILLISECS = 1000;

export const useDeviceShake = () => {
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(false);

  const event = useEvent();

  useEffect(() => {
    const subscription = accelerometer.subscribe({
      next: () => {},
      error: error => {
        log.warn('Accelerometer:', error);
        setSensorAvailable(false);
      },
    });

    subscription.unsubscribe();
    setSensorAvailable(true);
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
            now - lastShakeTime > MIN_TIME_BETWEEN_SHAKES_MILLISECS
          ) {
            setLastShakeTime(now);
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
  }, [event, lastShakeTime, sensorAvailable]);
};
