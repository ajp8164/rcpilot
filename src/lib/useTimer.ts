import {
  TimerEvent,
  TimerEventAlertPhrase,
  TimerMode,
  TimerOptions,
  TimerState,
} from 'types/timer';
import { useEffect, useRef, useState } from 'react';

import AlertService from './alertService';
import { DateTime } from 'luxon';

const timerModeAlertPhrase: TimerEventAlertPhrase = {
  [TimerEvent.Expired]: 'timer expired',
  [TimerEvent.Paused]: 'timer paused',
  [TimerEvent.Started]: 'timer started',
  [TimerEvent.Stopped]: 'timer stopped',
};

// All duration values are in milliseconds.

export const useTimer = (
  onTimerTick: (state: TimerState) => void,
  opts?: TimerOptions,
) => {
  const callback = useRef(onTimerTick).current;
  const errorCallback = useRef(opts?.errorCallback).current;

  const initialValue = useRef(opts?.initialValue || 0);
  const value = useRef(opts?.initialValue || 0);
  const interval = useRef(opts?.interval || 100); // milliseconds
  const [isCountdown, setIsCountdown] = useState(opts?.isCountdown || false);
  const allowOvertime = useRef(opts?.allowOvertime || false);
  const alerts = useRef(opts?.alerts || undefined);

  const inOvertime = useRef(false);
  const endTime = useRef<DateTime | undefined>(undefined);
  const expected = useRef<DateTime | undefined>(undefined);
  const startTime = useRef<DateTime | undefined>(undefined);
  const elapsed = useRef(0);
  const remaining = useRef<number | undefined>(undefined);
  const timeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const tickCount = useRef<number>(0);
  const [tick, setTick] = useState<number>(0);

  const [mode, setMode] = useState(TimerMode.Initial);

  const [state, setState] = useState<TimerState>({
    initialValue: initialValue.current,
    mode,
    isCountdown,
    inOvertime: inOvertime.current,
    tickCount: tickCount.current,
    elapsed: tickCount.current * interval.current,
    value: 0,
  });

  useEffect(() => {
    const newState: TimerState = {
      initialValue: initialValue.current,
      mode,
      isCountdown,
      inOvertime: inOvertime.current,
      tickCount: tickCount.current,
      elapsed: tickCount.current * interval.current, // Absolute elapsed timer duration in milliseconds
      value: value.current, // Timer value relative to 0 (significant with countdown timer) in milliseconds
    };

    setState(newState);
    callback(newState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCountdown, mode, tick]);

  const setCountdown = (cdValue: number) => {
    if (cdValue <= 0) {
      setIsCountdown(false);
      initialValue.current = 0;
      value.current = 0;
    } else {
      setIsCountdown(true);
      initialValue.current = cdValue;
      value.current = cdValue;
    }
  };

  const arm = () => {
    if (mode === TimerMode.Initial) {
      setMode(TimerMode.Armed);
    }
  };

  const disarm = () => {
    if (mode === TimerMode.Armed) {
      setMode(TimerMode.Initial);
    }
  };

  const start = () => {
    if (mode === TimerMode.Armed) {
      endTime.current = isCountdown
        ? DateTime.now().plus({ milliseconds: initialValue.current })
        : undefined;
    }

    if (mode === TimerMode.Armed || mode === TimerMode.Paused) {
      startTime.current = DateTime.now();
      expected.current = startTime.current.plus({
        milliseconds: interval.current,
      });
      timeout.current = setTimeout(onTick, interval.current);
      setMode(TimerMode.Running);
    }
    alert(TimerEvent.Started);
  };

  const pause = () => {
    if (mode === TimerMode.Running) {
      const now = DateTime.now();
      remaining.current = endTime.current
        ? endTime.current?.diff(now, ['milliseconds']).milliseconds
        : undefined;
      clearTimeout(timeout.current);
      setMode(TimerMode.Paused);
    }
    alert(TimerEvent.Paused);
  };

  const resume = () => {
    if (mode === TimerMode.Paused) {
      endTime.current = endTime.current
        ? DateTime.now().plus({ milliseconds: remaining.current || 0 })
        : undefined;
      start();
    }
  };

  const stop = () => {
    clearTimeout(timeout.current);
    setMode(TimerMode.Stopped);
    alert(TimerEvent.Stopped);
  };

  const onTick = () => {
    tickCount.current += 1;
    let drift = 0;
    if (expected.current) {
      drift = DateTime.now().diff(expected.current, [
        'milliseconds',
      ]).milliseconds;

      if (drift > interval.current) {
        errorCallback && errorCallback();
      }
    }

    let newMode = mode;
    if (isCountdown) {
      if (tickCount.current * interval.current > initialValue.current) {
        newMode = allowOvertime.current ? TimerMode.Running : TimerMode.Expired;
        setMode(newMode);
        inOvertime.current = true;
      } else if (
        tickCount.current * interval.current ===
        initialValue.current
      ) {
        alert(TimerEvent.Expired);
      }
    }

    if (newMode !== TimerMode.Expired) {
      expected.current = expected.current?.plus({
        milliseconds: interval.current,
      });
      timeout.current = setTimeout(onTick, interval.current - drift);
    }

    // Timer value is same as timer elapsed for count up timer.
    // Timer value goes negative for timer in overtime (countdown timer).
    if (endTime.current) {
      value.current =
        initialValue.current - tickCount.current * interval.current;
    } else {
      value.current =
        initialValue.current + tickCount.current * interval.current;
    }

    setTick(tickCount.current);
  };

  const alert = (timerEvent?: TimerEvent) => {
    alerts.current?.forEach(alert => {
      if (alert.enabled) {
        let alertPhrase;

        if (timerEvent && alert.atEvent === timerEvent) {
          alertPhrase = timerModeAlertPhrase[timerEvent] || '';
        } else {
          const elapsedSecs = Math.trunc(elapsed.current / 1000);
          if (alert.atEvent === `${elapsedSecs}`) {
            if (isCountdown) {
              if (!inOvertime.current) {
                alertPhrase = `${elapsedSecs} seconds remaining`;
              } else {
                alertPhrase = `${elapsedSecs} seconds over`;
              }
            } else {
              alertPhrase = `${elapsedSecs} seconds`;
            }
          }
        }

        if (alertPhrase) {
          !alert.voice && AlertService.play(alert.sound);
          alert.voice && AlertService.say(alertPhrase);
          alert.vibrate && AlertService.vibrate();
        }
      }
    });
  };

  return {
    state,
    arm,
    disarm,
    start,
    stop,
    pause,
    resume,
    setCountdown,
  };
};
