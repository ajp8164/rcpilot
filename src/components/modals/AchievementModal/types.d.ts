import React from 'react';

import { Commander } from 'realmdb/Commander';
import { Model } from 'realmdb/Model';

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
  present: (commander: Commander, model: Model) => void;
}
