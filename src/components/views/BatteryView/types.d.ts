import React from 'react';
import { ViewStyle } from 'react-native/types';

export declare type BatteryView = BatteryViewMethods;

declare const BatteryView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    BatteryViewProps & React.RefAttributes<BatteryViewMethods>
  >
>;

export interface BatteryViewProps {
  batteryId?: string;
};

export interface BatteryViewMethods {};
