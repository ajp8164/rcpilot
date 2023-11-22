import {SensorData, SensorTypes, accelerometer, setUpdateIntervalForType} from 'react-native-sensors';
import {filter, map} from 'rxjs/operators';
import { useEffect, useState } from 'react';

import { log } from '@react-native-ajp-elements/core';
import { useEvent } from 'lib/event';

const SHAKE_THRESHOLD = 26;
const MIN_TIME_BETWEEN_SHAKES_MILLISECS = 1000;

export const useDeviceShake = () => {
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(false);

  const event = useEvent();

  useEffect(() => {
    accelerometer
    .toPromise()
    .then(() => {
      setSensorAvailable(true);
      setUpdateIntervalForType(SensorTypes.accelerometer, 200)
    })
    .catch(() => {
      log.info('Sensor not available: accelerometer');
    });
  }, []);

  useEffect(() => {
    if (!sensorAvailable) return;
    
    const accelerometerSubscription = accelerometer
      .pipe(
        map(({ x, y, z }: SensorData) => Math.sqrt(
          Math.pow(x, 2) +
          Math.pow(y, 2) +
          Math.pow(z, 2)) /* - SensorManager.GRAVITY_EARTH */),
        filter(acceleration => acceleration > SHAKE_THRESHOLD))
      .subscribe(acceleration => {
        const curTime = new Date().getTime();
        if (curTime - lastShakeTime > MIN_TIME_BETWEEN_SHAKES_MILLISECS) {
          setLastShakeTime(curTime);
          event.emit('deviceShake', {acceleration});
        }
      });

    return () => {
      accelerometerSubscription.unsubscribe();
    };
  }, [sensorAvailable]);

};
