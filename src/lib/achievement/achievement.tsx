import { ReactElement } from 'react';

import { Star } from 'lucide-react-native';
import { Achievement } from 'realmdb/Pilot';

type AchievementRule = {
  criteria: {
    path: string;
    value: number;
    op: '=' | '>=' | '<=';
  }[];
  icon: ReactElement;
};

export const achievementConfig: Record<string, AchievementRule> = {
  ['First {Event}']: {
    criteria: [
      {
        path: 'model.statistics.totalEvents',
        value: 1,
        op: '>=',
      },
      {
        path: 'duration',
        value: 60,
        op: '>=',
      },
    ],
    icon: <Star color={'#0000ff'} size={60} />,
  },
};

export type AchievementNotification = {
  pilotName: string;
  modelName: string;
  achievement: Achievement;
};
