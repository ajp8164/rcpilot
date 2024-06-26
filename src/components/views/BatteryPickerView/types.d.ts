import { Battery } from 'realmdb/Battery';
import React from 'react';

export declare type BatteryPickerView = BatteryPickerViewMethods;

declare const BatteryPickerView: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    BatteryPickerViewProps & React.RefAttributes<BatteryPickerViewMethods>
  >
>;

export interface BatteryPickerViewProps {
  batteries: ArrayLike<Battery>;
  favoriteBatteries?: ArrayLike<Battery>;
  mode?: 'one' | 'many';
  selected?: Battery | Battery[]; // The literal value(s)
  onSelect: (batteries: Battery[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BatteryPickerViewMethods {}
