import { ChecklistType } from 'types/checklist';
import { Model } from 'realmdb/Model';

export const modelChecklistActionsPending = (model: Model, checklistType: ChecklistType) => {

  const checklists = model?.checklists.filter(c => {
    return c.type === checklistType;
  });

  return checklists;
};
