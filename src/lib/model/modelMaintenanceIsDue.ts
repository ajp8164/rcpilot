import { Model } from 'realmdb/Model';
import { ChecklistType } from 'types/checklist';

export const modelMaintenanceIsDue = (model: Model) => {
  const checklists = model.checklists?.filter(c => {
    return (
      c.type === ChecklistType.Maintenance ||
      c.type === ChecklistType.OneTimeMaintenance
    );
  });
  return checklists?.some(c => {
    return c.actions.some(a => a.schedule.state.due.now);
  });
};
