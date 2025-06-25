import { ChecklistType } from 'types/checklist';
import { Model } from 'realmdb/Model';

export const modelHasChecklists = (
  model: Model,
  checklistType: ChecklistType,
) => {
  return model?.checklists.some(c => {
    return c.type === checklistType;
  });
};
