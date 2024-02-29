import { useQuery, useRealm } from '@realm/react';

import { ChecklistType } from 'types/checklist';
import { Model } from 'realmdb/Model';
import { actionScheduleState } from 'lib/checklist';
import { useEffect } from 'react';

export const useChecklistActionScheduleUpdater = () => {
  const realm = useRealm();
  const allModels = useQuery(Model);

  useEffect(() => {
    allModels.forEach(model => {
      model.checklists.forEach(checklist => {
        checklist.actions.forEach(action => {
          realm.write(() => {
            action.schedule.state = actionScheduleState(action, ChecklistType.PreEvent, model);
          });
        });
      });
    });
  }, []);
};
