import { ListItem, ListItemInput } from 'components/atoms/List';
import React, { useEffect, useRef } from 'react';
import { eventKind, useEvent } from 'lib/event';
import { useObject, useRealm } from '@realm/react';

import { BSON } from 'realm';
import { DateTime } from 'luxon';
import { Divider } from '@react-native-ajp-elements/ui';
import { EmptyView } from 'components/molecules/EmptyView';
import { Model } from 'realmdb/Model';
import { ModelsNavigatorParamList } from 'types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NotesEditorResult } from 'components/NotesEditorScreen';
import { View } from 'react-native';
import { useTheme } from 'theme';

export type Props = NativeStackScreenProps<ModelsNavigatorParamList, 'ModelMaintenanceHistoryEntry'>;

const ModelMaintenanceHistoryEntryScreen = ({ navigation, route }: Props) => {
  const {
    modelId,
    checklistRefId,
    actionRefId,
    historyRefId,
  } = route.params;

  const theme = useTheme();
  const event = useEvent();
  const realm = useRealm();

  const model = useObject(Model, new BSON.ObjectId(modelId));
  const checklist = useRef(model?.checklists.find(c => c.refId === checklistRefId)).current;
  const action = useRef(checklist?.actions.find(a => a.refId === actionRefId)).current;
  const history = useRef(action?.history.find(h => h.refId === historyRefId)).current;

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('maintenance-action-notes', onChangeNotes);

    return () => {
      event.removeListener('maintenance-action-notes', onChangeNotes);
      
    };
  }, []);
  
  const onChangeCost = (value: number) => {
    realm.write(() => {
      action!.cost = value;
    });
  };

  const onChangeNotes = (result: NotesEditorResult) => {
    realm.write(() => {
      action!.notes = result.text;
    });
  };

  if (!action || !history) {
    return (
      <EmptyView error message={'Maintenance Action Not Found!'} />
    );    
  }

  return (
    <View style={theme.styles.view}>
      <Divider text={'COMPLETED MAINTENANCE'}/>
      <ListItem
        title={action?.description}
        subtitle={`${DateTime.fromISO(history.date).toFormat("M/d/yyyy 'at' h:mm a")}, following ${eventKind(model?.type).name.toLowerCase()} #${history.eventNumber}`}
        position={['first', 'last']}
        rightImage={false}
      />
      <Divider text={'MAINTENANCE COSTS'}/>
      <ListItemInput
        title={'Total Costs'}
        value={`${action.cost || 0}`}
        numeric={true}
        numericProps={{maxValue: 99999}}
        keyboardType={'number-pad'}
        placeholder={'None'}
        position={['first', 'last']}
        onChangeText={value => onChangeCost(parseFloat(value))}
        />
      <Divider text={'NOTES'}/>
      <ListItem
        title={action.notes || 'Notes'}
        position={['first', 'last']}
        onPress={() => navigation.navigate('NotesEditor', {
          title: 'Action Notes',
          text: action.notes,
          eventName: 'maintenance-action-notes',
        })}
      />
    </View>
  );
};

export default ModelMaintenanceHistoryEntryScreen;
