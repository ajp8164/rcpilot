import { Divider, ListItem } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useObject } from '@realm/react';
import { ListItemInput, ListItemNotes } from 'components/atoms/List';
import { EmptyView } from 'components/molecules/EmptyView';
import { Masks } from 'lib/inputMasks';
import { DateTime } from 'luxon';
import React, { useRef } from 'react';
import { View } from 'react-native';
import { BSON } from 'realm';
import { ChecklistAction } from 'realmdb/Checklist';
import { Model } from 'realmdb/Model';
import { useTheme } from 'theme';
import { ModelsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ModelsNavigatorParamList,
  'MaintenanceAction'
>;

const MaintenanceActionScreen = ({ route }: Props) => {
  const { modelId, checklistRefId, actionRefId } = route.params;

  const theme = useTheme();

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const checklist = useRef(
    model?.checklists.find(c => c.refId === checklistRefId),
  ).current;
  const action = useRef(
    checklist?.actions.find(a => a.refId === actionRefId),
  ).current;

  const lastTimePerformed = (action: ChecklistAction) => {
    if (action.history.length) {
      return DateTime.fromISO(
        action.history[action.history.length - 1].date,
      ).toFormat('MMM d, yyyy');
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
      />
      <Divider text={'ON SCHEDULE'} />
      <ListItem
        title={action.schedule.state.text}
        subtitle={`Last time was ${lastTimePerformed(action)}`}
        position={['first', 'last']}
      />
      <Divider text={'MAINTENANCE COSTS'} />
      <ListItemInput
        title={'Total Costs'}
        position={['first', 'last']}
        inputProps={{
          onChangeText: () => null,
          value: `${action.cost || 0}`,
          placeholder: '$0.00',
          mask: Masks.CURRENCY,
          rtlNumber: true,
          keyboardType: 'number-pad',
        }}
      />
      <Divider text={'NOTES'} />
      <ListItemNotes
        title={action.notes || 'No notes'}
        position={['first', 'last']}
      />
    </View>
  );
};

export default MaintenanceActionScreen;
