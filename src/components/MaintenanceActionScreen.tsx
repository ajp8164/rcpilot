import { ListItem, ListItemInput } from 'components/atoms/List';
import React, { useRef } from 'react';

import { BSON } from 'realm';
import { ChecklistAction } from 'realmdb/Checklist';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useObject } from '@realm/react';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'MaintenanceAction'>;

const MaintenanceActionScreen = ({ route }: Props) => {
  const { modelId, checklistRefId, actionRefId } = route.params;

  const theme = useTheme();

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const checklist = useRef(model?.checklists.find(c => c.refId === checklistRefId)).current;
  const action = useRef(checklist?.actions.find(a => a.refId === actionRefId)).current;

  const lastTimePerformed = (action: ChecklistAction) => {
    if (action.history.length) {
      return DateTime.fromISO(action.history[action.history.length - 1].date).toFormat(
        'MMM d, yyyy',
      );
    }
    return 'never';
  };

  if (!action) {
    return <EmptyView error message={'Maintenance Action Not Found!'} />;
  }

  return (
    <View style={theme.styles.view}>
      <Divider text={'PERFORM'} />
      <ListItem
        title={action?.description}
        subtitle={`From maintenance list '${checklist?.name}'`}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider text={'ON SCHEDULE'} />
      <ListItem
        title={action.schedule.state.text}
        subtitle={`Last time was ${lastTimePerformed(action)}`}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider text={'MAINTENANCE COSTS'} />
      <ListItemInput
        title={'Total Costs'}
        value={`${action.cost || 0}`}
        numeric={true}
        numericProps={{ maxValue: 99999 }}
        position={['first', 'last']}
        inputDisabled={true}
      />
      <Divider text={'NOTES'} />
      <ListItem
        title={action.notes || 'No notes'}
        position={['first', 'last']}
        rightImage={false}
      />
    </View>
  );
};

export default MaintenanceActionScreen;
