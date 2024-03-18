import { useQuery, useRealm } from '@realm/react';

import { Model } from 'realmdb/Model';
import { actionScheduleState } from 'lib/checklist';
import { useEffect } from 'react';

export const useChecklistActionScheduleUpdater = () => {
  const realm = useRealm();
  const allModels = useQuery(Model);

  useEffect(() => {
    realm.write(() => {
      allModels.forEach(model => {
        model.checklists.forEach(checklist => {
          const checklistType = checklist.type;
          checklist.actions.forEach(action => {
            action.schedule.state = actionScheduleState(action, checklistType, model);
          });
        });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
