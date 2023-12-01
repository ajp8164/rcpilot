import { ISODateString, ISODurationString } from './common';

export enum EventOutcome {
    OneStar = '1',
    TwoStar = '2',
    ThreeStar = '3',
    FourStar = '4',
    Crash = 'C',
}

export type EventStyle = {
  id: string;
  name: string;
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