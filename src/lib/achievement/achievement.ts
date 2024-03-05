import { Achievement } from "realmdb/Pilot";
import { ColorValue } from "react-native";

type AchievementRule = {
  criteria: {
    path: string;
    value: number;
    op: '=' | '>=' | '<=';
  }[],
  icon: string;
  iconColor: ColorValue;
};

export const achievementConfig: Record<string, AchievementRule> = {
  ['First {Event}']: {
    criteria: [{
      path: 'model.statistics.totalEvents',
      value: 1,
      op: '>=',
    }, {
      path: 'duration',
      value: 60,
      op: '>=',
    }],
    icon: 'star',
    iconColor: 'blue',
  },
};

export type AchievementNotification = {
  pilotName: string;
  modelName: string;
  achievement: Achievement;
};
