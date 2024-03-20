import { Model } from 'realmdb/Model';
import { Pilot } from 'realmdb/Pilot';
import React from 'react';

export declare type AchievementModal = AchievementModalMethods;

declare const LegalModal: React.MemoExoticComponent<
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
