import { ISODateString, ISODurationString } from './common';

export enum EventOutcome {
    OneStar = '1',
    TwoStar = '2',
    ThreeStar = '3',
    FourStar = '4',
    Crash = 'C',
};

export type Event = {
    id: string;
    number: number;
    outcome: EventOutcome;
    date: ISODateString;
    duration: ISODurationString;
    modelId: string;
    pilotId: string;
    locationId: string;
    fuelId: string;
    propellerId: string;
    styleId: string;
    fuelConsumed: number;
    batteryCycleId: string;
    notes: string;
};

export enum TimerStartDelay {
  None = 'None',
  Seconds5 = '5 seconds',
  Seconds10 = '10 seconds',
  Seconds15 = '15 seconds',
  Seconds20 = '20 seconds',
  Seconds25 = '25 seconds',
  Seconds30 = '30 seconds',
};

export enum ChimeWhileArmed {
  None = 'None',
  Seconds5 = '5 seconds',
  Seconds10 = '10 seconds',
  Seconds15 = '15 seconds',
  Seconds30 = '30 seconds',
  Minutes1 = '1 minute',
  Minutes2 = '2 minutes',
};

export enum ChimeWhileRunning {
  None = 'None',
  Seconds15 = '15 seconds',
  Seconds30 = '30 seconds',
  Minutes1 = '1 minute',
  Minutes2 = '2 minutes',
  Minutes3 = '3 minutes',
  Minutes4 = '4 minutes',
  Minutes5 = '5 minutes',
  Minutes6 = '6 minutes',
  Minutes7 = '7 minutes',
  Minutes8 = '8 minutes',
  Minutes9 = '9 minutes',
  Minutes10 = '10 minutes',
};

export enum ChimeAfterExpiring {
  None = 'None',
  Seconds5 = '5 seconds',
  Seconds10 = '10 seconds',
  Seconds15 = '15 seconds',
  Seconds30 = '30 seconds',
  Minutes1 = '1 minute',
  Minutes2 = '2 minutes',
  Minutes3 = '3 minutes',
  Minutes4 = '4 minutes',
  Minutes5 = '5 minutes',
};

export enum AudioVoice {
  Alex = 'Alex',
  Fiona = 'Fiona',
};

export enum VoiceWhileRunning {
  None = 'None',
  Minutes1 = '1 minute',
  Minutes2 = '2 minutes',
  Minutes3 = '3 minutes',
  Minutes4 = '4 minutes',
  Minutes5 = '5 minutes',
  Minutes6 = '6 minutes',
  Minutes7 = '7 minutes',
  Minutes8 = '8 minutes',
  Minutes9 = '9 minutes',
  Minutes10 = '10 minutes',
};

export enum VoiceAfterExpiring {
  None = 'None',
  Minutes1 = '1 minute',
  Minutes2 = '2 minutes',
  Minutes3 = '3 minutes',
  Minutes4 = '4 minutes',
  Minutes5 = '5 minutes',
};

export enum ClickTrackWhileRunning {
  None = 'None',
  BPM15 = '15 BPM',
  BPM20 = '20 BPM',
  BPM30 = '30 BPM',
  BPM40 = '40 BPM',
  BPM45 = '45 BPM',
  BPM50 = '50 BPM',
  BPM60 = '60 BPM',
  BPM75 = '75 BPM',
  BPM90 = '90 BPM',
  BPM100 = '100 BPM',
  BPM120 = '120 BPM',
  BPM150 = '150 BPM',
  BPM180 = '180 BPM',
  BPM200 = '200 BPM',
  BPM240 = '240 BPM',
};

export enum ClickTrackAfterExpiring {
  None = 'None',
  BPM15 = '15 BPM',
  BPM20 = '20 BPM',
  BPM30 = '30 BPM',
  BPM40 = '40 BPM',
  BPM45 = '45 BPM',
  BPM50 = '50 BPM',
  BPM60 = '60 BPM',
  BPM75 = '75 BPM',
  BPM90 = '90 BPM',
  BPM100 = '100 BPM',
  BPM120 = '120 BPM',
  BPM150 = '150 BPM',
  BPM180 = '180 BPM',
  BPM200 = '200 BPM',
  BPM240 = '240 BPM',
};
