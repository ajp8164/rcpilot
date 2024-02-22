export enum TimerType {
  Countdown = 'Countdown',
  CountUp = 'CountUp',
}

export enum TimerMode {
  Armed = 'Armed',
  Expired = 'Expired',
  Initial = 'Initial',
  Paused = 'Paused',
  Running = 'Running',
  Stopped = 'Stopped',
}

export enum TimerEvent {
  Expired = 'Expired',
  Paused = 'Paused',
  Started = 'Started',
  Stopped = 'Stopped',
}

export type TimerAlert = {
  atEvent: TimerEvent | string;
  enabled: boolean;
  voice: boolean;
  sound: string;
  vibrate: boolean;
};

export type TimerEventAlertPhrase = {
  [key in TimerEvent]: string;
};

export type TimerState = {
  elapsed: number;
  initialValue: number;
  isCountdown: boolean;
  inOvertime: boolean;
  mode: TimerMode;
  tickCount: number;
  value: number;
};

export type TimerOptions = {
  allowOvertime?: boolean;
  errorCallback?: () => void;
  initialValue?: number;
  interval?: number;
  isCountdown?: boolean;
  alerts?: TimerAlert[];
};
