import { ChecklistType } from 'types/checklist';
import { Model } from 'realmdb/Model';

export const modelChecklistPending = (model: Model, checklistType: ChecklistType) => {

  const checklists = model?.checklists.filter(c => {
    return c.type === checklistType;
  });

  return checklists;
};
