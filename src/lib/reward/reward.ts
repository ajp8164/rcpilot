import { Model } from 'realmdb/Model';

const rewards = [
  {
    eventCount: 10,
    name: '',
    icon: 'star',
    iconColor: '#787878',
  },
  {
    eventCount: 15,
    name: '',
    icon: 'award',
    iconColor: '#007bff',
  },
  {
    eventCount: 25,
    name: '',
    icon: 'medal',
    iconColor: '#cd7f32',
  },
  {
    eventCount: 40,
    name: '#f9a825',
    icon: 'trophy',
    iconColor: '#c0c0c0',
  },
  {
    eventCount: 50,
    name: '',
    icon: 'crown',
    iconColor: '#daa00a',
  },
];

export const reward = (model: Model) => {
  let reward = rewards[0];
  const count = model.totalEvents || 0;

  for (let i = 0; i <= rewards.length - 1; i++) {
    if (count <= rewards[i].eventCount) {
      reward = rewards[i];
      break;
    }
  };
  return reward;
};
