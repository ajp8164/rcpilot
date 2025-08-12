import { Model } from 'realmdb/Model';
import { ChecklistType } from 'types/checklist';

export const modelHasChecklists = (
  model: Model,
  checklistType: ChecklistType,
) => {
  return model?.checklists.some(c => {
    return c.type === checklistType;
  });
};
