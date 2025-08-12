import React from 'react';
import { Model } from 'realmdb/Model';
import { Pilot } from 'realmdb/Pilot';

export declare type AchievementModal = AchievementModalMethods;

declare const AchievementModal: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    AchievementModalProps & React.RefAttributes<AchievementModalMethods>
  >
>;

export interface AchievementModalProps {
  onDismiss?: (text: string) => void;
  snapPoints?: (string | number)[];
}

export interface AchievementModalMethods {
  dismiss: () => void;
  present: (pilot: Pilot, model: Model) => void;
}
